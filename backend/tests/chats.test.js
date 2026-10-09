import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../src/app.js";
import Chat from "../src/models/Chat.js";
import Hire from "../src/models/Hire.js";
import { setupDatabase } from "./fixtures.js";

let fixture, server, base;
before(async () => {
  fixture = await setupDatabase();
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await fixture?.cleanup();
});
const request = async (path, token, method = "GET", body) => {
  const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
};
const create = (developerId = fixture.developer.id) => request("/chats", fixture.companyToken, "POST", { developerId });

test("concurrent contact requests reuse a single conversation", async () => {
  const results = await Promise.all(Array.from({ length: 8 }, () => create()));
  assert.ok(results.every((result) => result.status === 201));
  assert.equal(new Set(results.map((result) => result.body.id)).size, 1);
  assert.equal(await Chat.countDocuments(), 1);
  assert.equal(results[0].body.developerName, "Sam Taylor");
  assert.equal(results[0].body.devTitle, "Frontend engineer");
});

test("both roles send correctly attributed messages; retries never duplicate", async () => {
  const { body: chat } = await create();
  const path = `/chats/${chat.id}/messages`;
  await request(path, fixture.companyToken, "POST", { text: " Hello Sam ", clientMessageId: "company-hello" });
  const retry = await request(path, fixture.companyToken, "POST", { text: " Hello Sam ", clientMessageId: "company-hello" });
  assert.equal(retry.body.messages.filter((message) => message.clientMessageId === "company-hello").length, 1);
  const reply = await request(path, fixture.developerToken, "POST", { text: "Hi!\nHappy to chat.", clientMessageId: "dev-reply" });
  assert.equal(reply.status, 200);
  assert.equal(reply.body.messages.at(-1).from, "dev");
  assert.equal(reply.body.messages[0].from, "company");
  assert.equal(reply.body.messages[0].text, "Hello Sam");
  const companyView = await request("/chats", fixture.companyToken);
  assert.equal(companyView.body[0].messages.at(-1).from, "dev");
  assert.equal(companyView.body[0].unread, 1);
});

test("simultaneous sends preserve every message and idempotency", async () => {
  const { body: chat } = await create();
  const path = `/chats/${chat.id}/messages`;
  const results = await Promise.all(Array.from({ length: 12 }, (_, index) => request(path, index % 2 ? fixture.developerToken : fixture.companyToken, "POST", { text: `Concurrent ${index}`, clientMessageId: `concurrent-${index}` })));
  assert.ok(results.every((result) => result.status === 200));
  const stored = await Chat.findById(chat.id);
  assert.equal(stored.messages.filter((message) => message.text.startsWith("Concurrent")).length, 12);
  await Promise.all(Array.from({ length: 5 }, () => request(path, fixture.companyToken, "POST", { text: "One retry", clientMessageId: "same-retry" })));
  const updated = await Chat.findById(chat.id);
  assert.equal(updated.messages.filter((message) => message.clientMessageId === "same-retry").length, 1);
});

test("read acknowledgement only clears messages actually displayed", async () => {
  const { body: chat } = await create();
  const old = await request(`/chats/${chat.id}/messages`, fixture.companyToken, "POST", { text: "Displayed message" });
  const cutoff = old.body.messages.at(-1).id;
  await request(`/chats/${chat.id}/messages`, fixture.companyToken, "POST", { text: "Arrived later" });
  const read = await request(`/chats/${chat.id}/read`, fixture.developerToken, "PATCH", { lastMessageId: cutoff });
  assert.equal(read.status, 200);
  const devView = await request("/chats", fixture.developerToken);
  assert.equal(devView.body[0].unread, 1);
  assert.ok(devView.body[0].messages.find((message) => message.id === cutoff).readAt);
  assert.equal(devView.body[0].messages.at(-1).readAt, null);
});

test("authentication, participant checks, and message validation are enforced", async () => {
  const { body: chat } = await create();
  assert.equal((await request("/chats")).status, 401);
  assert.equal((await request("/chats", fixture.pendingToken)).status, 403);
  assert.equal((await request(`/chats/${chat.id}/messages`, fixture.outsiderToken, "POST", { text: "Intruder" })).status, 403);
  assert.deepEqual((await request("/chats", fixture.outsiderToken)).body, []);
  for (const text of ["   ", 123, {}, "a".repeat(5001)]) assert.equal((await request(`/chats/${chat.id}/messages`, fixture.companyToken, "POST", { text })).status, 400);
  assert.equal((await request("/chats/not-an-id/messages", fixture.companyToken, "POST", { text: "Hi" })).status, 400);
  assert.equal((await create(fixture.pendingDeveloper.id)).status, 403);
  assert.equal((await request(`/chats/${chat.id}/read`, fixture.outsiderToken, "PATCH", { lastMessageId: chat.messages.at(-1).id })).status, 403);
});

test("only the owning company can change valid stages; hired records are unique", async () => {
  const { body: chat } = await create();
  const path = `/chats/${chat.id}/phase`;
  assert.equal((await request(path, fixture.developerToken, "PATCH", { phase: "Offer" })).status, 403);
  assert.equal((await request(path, fixture.outsiderToken, "PATCH", { phase: "Offer" })).status, 403);
  assert.equal((await request(path, fixture.companyToken, "PATCH", { phase: "Unknown" })).status, 400);
  assert.equal((await request(path, fixture.companyToken, "PATCH", { phase: "Hired" })).body.phase, "Hired");
  await request(path, fixture.companyToken, "PATCH", { phase: "Hired" });
  assert.equal(await Hire.countDocuments(), 1);
});

test("logout expires the session cookie", async () => {
  const response = await fetch(base + "/auth/logout", { method: "POST" });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /hiremeSession=;/);
});
