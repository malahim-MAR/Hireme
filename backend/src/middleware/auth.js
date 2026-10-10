import crypto from "crypto";
import Company from "../models/Company.js";
import Developer from "../models/Developer.js";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 12;

const secret = () => process.env.SESSION_SECRET || "hireme-local-session-secret";
const adminPassword = () => process.env.ADMIN_PASSWORD || "admin123";

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

export const dashboardFor = (role) => role === "company" ? "/company-dashboard" : "/dev-dashboard";

export const signToken = (payload, ttlSeconds = TOKEN_TTL_SECONDS) => {
  const body = encode({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  const signature = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
};

export const verifyToken = (token) => {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = decode(body);
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};

export const tokenFromRequest = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  const cookies = Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((cookie) => {
    const [key, ...value] = cookie.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
  return cookies.hiremeSession || null;
};

const modelForRole = (role) => {
  if (role === "company") return Company;
  if (role === "developer") return Developer;
  return null;
};

export const publicAccount = (role, account) => {
  if (role === "company") {
    return {
      id: account._id,
      role,
      type: role,
      companyName: account.companyName,
      workEmail: account.workEmail,
      phoneNumber: account.phoneNumber,
      location: account.location,
      industry: account.industry,
      website: account.website,
      employeeCount: account.employeeCount,
      description: account.description,
      verificationStatus: account.verificationStatus,
      adminNote: account.adminNote || account.adminNotes || "",
      adminNotes: account.adminNote || account.adminNotes || "",
    };
  }

  return {
    id: account._id,
    role,
    type: role,
    name: account.name,
    email: account.email,
    currentCompany: account.currentCompany,
    yearsOfExperience: account.yearsOfExperience,
    linkedinProfile: account.linkedinProfile,
    phoneNumber: account.phoneNumber,
    location: account.location,
    portfolio: account.portfolio,
    primarySkills: account.primarySkills,
    verificationStatus: account.verificationStatus,
    adminNote: account.adminNote || account.adminNotes || "",
    adminNotes: account.adminNote || account.adminNotes || "",
  };
};

export const issueSession = (role, account) => ({
  token: signToken({ role, accountId: String(account._id), kind: "account" }),
  account: publicAccount(role, account),
});

export const issueAdminSession = () => ({
  token: signToken({ kind: "admin" }, ADMIN_TOKEN_TTL_SECONDS),
});

export const validAdminPassword = (password) => password === adminPassword();

export const requireAuth = async (req, res, next) => {
  try {
    const payload = verifyToken(tokenFromRequest(req));
    if (!payload || payload.kind !== "account") {
      return res.status(401).json({ message: "Authentication required." });
    }

    const Model = modelForRole(payload.role);
    const account = Model ? await Model.findById(payload.accountId) : null;
    if (!account) return res.status(401).json({ message: "Authentication required." });

    req.account = account;
    req.accountRole = payload.role;
    next();
  } catch {
    res.status(401).json({ message: "Authentication required." });
  }
};

export const requireVerifiedRole = (role) => (req, res, next) => {
  if (req.accountRole !== role) {
    return res.status(403).json({ message: "Wrong role.", redirectTo: dashboardFor(req.accountRole) });
  }
  if (req.account.verificationStatus !== "verified") {
    return res.status(403).json({ message: "Admin verification required.", redirectTo: "/waiting-review" });
  }
  next();
};

export const requireAnyVerified = (req, res, next) => {
  if (req.account.verificationStatus !== "verified") {
    return res.status(403).json({ message: "Admin verification required.", redirectTo: "/waiting-review" });
  }
  next();
};

export const requireAdmin = (_req, _res, next) => {
  next();
};
