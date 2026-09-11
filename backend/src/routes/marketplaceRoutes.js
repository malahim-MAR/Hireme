import express from "express";
import {
  getChats,
  createChat,
  getCompanyProfile,
  getDeveloperProfile,
  getDevelopers,
  sendChatMessage,
  updateChatPhase,
  updateCompanyProfile,
  updateDeveloperProfile,
} from "../controllers/marketplaceController.js";

const router = express.Router();

router.get("/developers", getDevelopers);
router.get("/developers/:id/profile", getDeveloperProfile);
router.patch("/developers/:id/profile", updateDeveloperProfile);
router.get("/companies/:id/profile", getCompanyProfile);
router.patch("/companies/:id/profile", updateCompanyProfile);
router.get("/chats", getChats);
router.post("/chats", createChat);
router.post("/chats/:id/messages", sendChatMessage);
router.patch("/chats/:id/phase", updateChatPhase);

export default router;
