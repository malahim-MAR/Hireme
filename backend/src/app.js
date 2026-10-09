import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";

import dotenv from "dotenv";

import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Company from "./models/Company.js";
import Developer from "./models/Developer.js";
import { dashboardFor, tokenFromRequest, verifyToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const frontendDist = fileURLToPath(new URL("../../frontend/dist/", import.meta.url));


app.use(express.json());

if (process.env.NODE_ENV?.toLowerCase() !== "production") {
  app.use(
    cors({
      origin: [/^http:\/\/localhost:517\d$/],
      credentials: true,
    })
  );
}
// app.use(rateLimiter);
app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", marketplaceRoutes);

if (process.env.NODE_ENV?.toLowerCase() === "production") {
  const protectedDocuments = {
    "/dev-dashboard": "developer",
    "/dev-profile": "developer",
    "/dev-chat": "developer",
    "/company-dashboard": "company",
    "/hire": "company",
    "/company-profile": "company",
    "/company-chat": "company",
  };

  app.get([...Object.keys(protectedDocuments), "/login", "/company-login", "/waiting-review"], async (req, res, next) => {
    const payload = verifyToken(tokenFromRequest(req));
    const account = payload?.kind === "account"
      ? await (payload.role === "company" ? Company : Developer).findById(payload.accountId)
      : null;
    const requiredRole = protectedDocuments[req.path];

    if (!account) return requiredRole ? res.redirect("/") : next();
    if (account.verificationStatus === "verified" && ["/login", "/company-login", "/waiting-review"].includes(req.path)) {
      return res.redirect(dashboardFor(payload.role));
    }
    if (req.path === "/waiting-review") return next();
    if (requiredRole && account.verificationStatus !== "verified") return res.redirect("/waiting-review");
    if (requiredRole && payload.role !== requiredRole) return res.redirect(dashboardFor(payload.role));
    next();
  });

  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// app.get('/api/notes', (req, res) => {
//     res.send("Running Server Successfully");
// }
// )

export default app;

