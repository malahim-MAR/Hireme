import express from "express";
import {
  adminLogin,
  developerSignup,
  developerLogin,
  companySignup,
  companyLogin,
  getAdminSummary,
  getPendingAccounts,
  getSessionAccount,
  resubmitAccountReview,
  updateAccountReview,
} from "../controllers/authController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Developer routes
router.post("/developer/signup", developerSignup);
router.post("/developer/login", developerLogin);

// Company routes
router.post("/company/signup", companySignup);
router.post("/company/login", companyLogin);

router.get("/me", requireAuth, getSessionAccount);
router.post("/logout", (_req, res) => {
  res.clearCookie("hiremeSession", { path: "/" });
  res.status(200).json({ message: "Signed out." });
});
router.patch("/resubmit", requireAuth, resubmitAccountReview);

// Admin review routes
router.post("/admin/login", adminLogin);
router.get("/admin/pending", requireAdmin, getPendingAccounts);
router.get("/admin/summary", requireAdmin, getAdminSummary);
router.patch("/admin/:role/:id/review", requireAdmin, updateAccountReview);

export default router;
