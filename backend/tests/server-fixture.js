import app from "../src/app.js";
import { setupDatabase } from "./fixtures.js";
import Chat from "../src/models/Chat.js";
import Hire from "../src/models/Hire.js";
const fixture = await setupDatabase();
app.post("/__test/reset", async (_req, res) => {
  await Promise.all([Chat.deleteMany({}), Hire.deleteMany({})]);
  res.json({ ok: true });
});
const server = app.listen(5001, () => console.log("Test API ready on 5001 (temporary database)"));
const close = () => server.close(async () => { await fixture.cleanup(); process.exit(0); });
process.on("SIGINT", close);
process.on("SIGTERM", close);
