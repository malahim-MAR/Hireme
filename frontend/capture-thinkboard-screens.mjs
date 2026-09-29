import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9333;
const origin = "http://localhost:5173";
const outDir = join(process.cwd(), "screenshots-thinkboard");
const profileDir = join(outDir, `chrome-profile-${Date.now()}`);

const routes = [
  { path: "/", role: null, name: "01-start" },
  { path: "/dev-dashboard", role: "developer", name: "02-dev-dashboard" },
  { path: "/company-dashboard", role: "company", name: "03-company-dashboard" },
  { path: "/hire", role: "company", name: "04-hire" },
  { path: "/dev-chat", role: "developer", name: "05-dev-chat" },
  { path: "/company-chat", role: "company", name: "06-company-chat" },
  { path: "/dev-profile", role: "developer", name: "07-dev-profile" },
  { path: "/company-profile", role: "company", name: "08-company-profile" },
];

const developerAccount = {
  id: "dev-1",
  role: "developer",
  name: "Sam Taylor",
  email: "sam@example.com",
  verificationStatus: "verified",
};

const companyAccount = {
  id: "company-1",
  role: "company",
  companyName: "Northstar Labs",
  workEmail: "hiring@northstar.example",
  verificationStatus: "verified",
};

const developers = [
  {
    id: "dev-1",
    initials: "ST",
    name: "Sam Taylor",
    title: "Frontend engineer",
    bio: "Builds product interfaces with React, accessibility, and design systems.",
    level: "Senior",
    experience: "7 years",
    country: "Pakistan",
    city: "Lahore",
    skills: ["react", "typescript", "node"],
    availability: "Immediately",
  },
  {
    id: "dev-2",
    initials: "AK",
    name: "Amina Khan",
    title: "Full-stack developer",
    bio: "Ships dashboards, APIs, and collaborative workflows for hiring teams.",
    level: "Mid",
    experience: "4 years",
    country: "UAE",
    city: "Dubai",
    skills: ["nextjs", "postgres", "tailwind"],
    availability: "Within 2 weeks",
  },
  {
    id: "dev-3",
    initials: "JR",
    name: "Jules Rivera",
    title: "Backend engineer",
    bio: "Designs reliable services, job queues, and observability for growing products.",
    level: "Senior",
    experience: "8 years",
    country: "United States",
    city: "Austin",
    skills: ["go", "kubernetes", "redis"],
    availability: "Within 1 month",
  },
];

const chats = [
  {
    id: "chat-1",
    companyId: "company-1",
    developerId: "dev-1",
    companyName: "Northstar Labs",
    developerName: "Sam Taylor",
    devName: "Sam Taylor",
    devTitle: "Frontend engineer",
    companyInitials: "NL",
    devInitials: "ST",
    phase: "Interview",
    lastMessage: "Tuesday works for a technical call.",
    time: new Date().toISOString(),
    unread: 2,
    messages: [
      { from: "company", text: "Your React work looks relevant to our editor project.", time: new Date(Date.now() - 3600000).toISOString() },
      { from: "dev", text: "Happy to walk through the architecture and tradeoffs.", time: new Date(Date.now() - 2400000).toISOString() },
      { from: "company", text: "Tuesday works for a technical call.", time: new Date(Date.now() - 1200000).toISOString() },
    ],
  },
  {
    id: "chat-2",
    companyId: "company-2",
    developerId: "dev-1",
    companyName: "Orbit Works",
    developerName: "Sam Taylor",
    devName: "Sam Taylor",
    devTitle: "Frontend engineer",
    companyInitials: "OW",
    devInitials: "ST",
    phase: "Screening",
    lastMessage: "Can you share your availability?",
    time: new Date(Date.now() - 86400000).toISOString(),
    unread: 0,
    messages: [
      { from: "company", text: "Can you share your availability?", time: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
];

const mockScript = `
(() => {
  const developerAccount = ${JSON.stringify(developerAccount)};
  const companyAccount = ${JSON.stringify(companyAccount)};
  const developers = ${JSON.stringify(developers)};
  const chats = ${JSON.stringify(chats)};
  const originalFetch = window.fetch.bind(window);

  window.__setThinkBoardRole = (role) => {
    if (!role) {
      localStorage.removeItem("hiremeAccount");
      localStorage.removeItem("hiremeToken");
      return;
    }
    localStorage.setItem("hiremeAccount", JSON.stringify(role === "company" ? companyAccount : developerAccount));
    localStorage.setItem("hiremeToken", "visual-review-token");
  };

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.includes("localhost:5001/api")) return originalFetch(input, init);
    const path = new URL(url).pathname.replace("/api", "");
    const role = JSON.parse(localStorage.getItem("hiremeAccount") || "null")?.role;
    const json = (data) => Promise.resolve(new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));

    if (path === "/auth/me") return json({ account: role === "company" ? companyAccount : developerAccount });
    if (path === "/developers") return json(developers);
    if (path === "/chats") return json(chats);
    if (path.includes("/developers/")) return json({
      ...developers[0],
      profile: { ...developers[0], fullName: developers[0].name, about: developers[0].bio, email: developerAccount.email, github: "https://github.com/sam", linkedin: "https://linkedin.com/in/sam", portfolio: "https://sam.example", education: "BS Computer Science" },
      fullName: developers[0].name,
      about: developers[0].bio,
      email: developerAccount.email,
      github: "https://github.com/sam",
      linkedin: "https://linkedin.com/in/sam",
      portfolio: "https://sam.example",
      education: "BS Computer Science"
    });
    if (path.includes("/companies/")) return json({
      ...companyAccount,
      companyProfile: {
        about: "Northstar Labs builds hiring tools for distributed product teams.",
        totalHires: 18,
        openRoles: 4,
        preferredStacks: ["React", "Node.js", "Postgres"],
        hiringHistory: ["2026: hired 6 product engineers", "2025: launched remote internship program"]
      }
    });
    return json({});
  };
})();
`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJsonWithRetry(url, attempts = 20) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      return response.json();
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }
  throw lastError;
}

async function fetchJsonWithRetry(url, options = {}, attempts = 20) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url, options);
      return response.json();
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }
  throw lastError;
}

async function send(ws, method, params = {}) {
  send.id = (send.id || 0) + 1;
  const id = send.id;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 5000);
    const onMessage = (event) => {
      const raw = typeof event.data === "string" ? event.data : Buffer.from(event.data).toString("utf8");
      const data = JSON.parse(raw);
      if (data.id !== id) return;
      clearTimeout(timer);
      ws.removeEventListener("message", onMessage);
      if (data.error) reject(new Error(data.error.message));
      else resolve(data.result);
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1000",
    "about:blank",
  ], { stdio: "ignore" });

  try {
    const pages = await getJsonWithRetry(`http://127.0.0.1:${port}/json`);
    const ws = new WebSocket(pages[0].webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
    console.log("Connected to Chrome");
    await send(ws, "Page.enable");
    await send(ws, "Runtime.enable");
    await send(ws, "Page.addScriptToEvaluateOnNewDocument", { source: mockScript });
    await send(ws, "Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

    for (const route of routes) {
      console.log(`Capturing ${route.path}`);
      await send(ws, "Runtime.evaluate", { expression: `window.__setThinkBoardRole && window.__setThinkBoardRole(${JSON.stringify(route.role)})` });
      await send(ws, "Page.navigate", { url: `${origin}${route.path}` });
      await delay(1400);
      const screenshot = await send(ws, "Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      const file = join(outDir, `${route.name}.png`);
      await import("node:fs/promises").then(({ writeFile }) => writeFile(file, Buffer.from(screenshot.data, "base64")));
      console.log(file);
    }
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
