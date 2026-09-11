import express from "express";
import {
  developerSignup,
  developerLogin,
  companySignup,
  companyLogin,
  getPendingAccounts,
  updateAccountReview,
} from "../controllers/authController.js";

const router = express.Router();

// Developer routes
router.post("/developer/signup", developerSignup);
router.post("/developer/login", developerLogin);

// Company routes
router.post("/company/signup", companySignup);
router.post("/company/login", companyLogin);

// Admin review routes
router.get("/admin/pending", getPendingAccounts);
router.patch("/admin/:role/:id/review", updateAccountReview);

export default router;
