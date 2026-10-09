import express from "express";
import {
  getChats,
  markChatRead,
  createChat,
  getCompanyProfile,
  getDeveloperProfile,
  getDevelopers,
  sendChatMessage,
  updateChatPhase,
  updateCompanyProfile,
  updateDeveloperProfile,
} from "../controllers/marketplaceController.js";
import { requireAnyVerified, requireAuth, requireVerifiedRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/developers", requireAuth, requireVerifiedRole("company"), getDevelopers);
router.get("/developers/:id/profile", requireAuth, requireAnyVerified, getDeveloperProfile);
router.patch("/developers/:id/profile", requireAuth, requireVerifiedRole("developer"), updateDeveloperProfile);
router.get("/companies/:id/profile", requireAuth, requireVerifiedRole("company"), getCompanyProfile);
router.patch("/companies/:id/profile", requireAuth, requireVerifiedRole("company"), updateCompanyProfile);
router.get("/chats", requireAuth, requireAnyVerified, getChats);
router.post("/chats", requireAuth, requireVerifiedRole("company"), createChat);
router.post("/chats/:id/messages", requireAuth, requireAnyVerified, sendChatMessage);
router.patch("/chats/:id/read", requireAuth, requireAnyVerified, markChatRead);
router.patch("/chats/:id/phase", requireAuth, requireVerifiedRole("company"), updateChatPhase);

export default router;
