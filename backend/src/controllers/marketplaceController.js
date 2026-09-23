import Company from "../models/Company.js";
import CompanyProfile from "../models/CompanyProfile.js";
import Chat from "../models/Chat.js";
import Developer from "../models/Developer.js";
import DevProfile from "../models/DevProfile.js";
import Hire from "../models/Hire.js";

const roleModel = (role) => role === "company" ? Company : Developer;
const modelName = (role) => role === "company" ? "Company" : "Developer";
const initials = (name = "") => name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const publicDeveloper = (developer, profile = {}) => ({
  id: developer._id,
  name: developer.name,
  email: developer.email,
  currentCompany: developer.currentCompany,
  yearsOfExperience: developer.yearsOfExperience,
  phoneNumber: developer.phoneNumber,
  location: developer.location,
  linkedinProfile: developer.linkedinProfile,
  portfolio: developer.portfolio,
  initials: initials(profile.fullName || developer.name),
  title: profile.title || "Developer",
  bio: profile.about || "",
  level: profile.level || "",
  experience: profile.experience || `${developer.yearsOfExperience || 0} years`,
  country: profile.country || "",
  city: profile.city || developer.location || "",
  skills: profile.skills?.length ? profile.skills : developer.primarySkills ? developer.primarySkills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
  availability: profile.availability || "",
  profile,
});

const publicCompany = (company, profile = {}) => ({
  id: company._id,
  companyName: company.companyName,
  workEmail: company.workEmail,
  phoneNumber: company.phoneNumber,
  location: company.location,
  industry: company.industry,
  description: company.description,
  initials: initials(company.companyName),
  about: profile.about || company.description || "",
  profile,
});

const loadDevelopers = async () => {
  const developers = await Developer.find({ verificationStatus: "verified" }).sort({ createdAt: -1 });
  const profiles = await Promise.all(developers.map((developer) => DevProfile.findOneAndUpdate(
    { developer: developer._id },
    {
      $setOnInsert: {
        fullName: developer.name,
        email: developer.email,
        experience: `${developer.yearsOfExperience || 0} years`,
        skills: developer.primarySkills ? developer.primarySkills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
        linkedin: developer.linkedinProfile,
        portfolio: developer.portfolio,
        city: developer.location,
      },
    },
    { upsert: true, new: true }
  ).lean()));
  const profileMap = new Map(profiles.map((profile) => [String(profile.developer), profile]));
  return developers.map((developer) => publicDeveloper(developer, profileMap.get(String(developer._id)) || {}));
};

export const getDevelopers = async (_req, res) => {
  try {
    res.status(200).json(await loadDevelopers());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeveloperProfile = async (req, res) => {
  try {
    if (req.accountRole === "developer" && String(req.account._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "You can only access your own developer profile." });
    }
    const developer = await Developer.findById(req.params.id);
    if (!developer) return res.status(404).json({ message: "Developer not found." });
    const profile = await DevProfile.findOne({ developer: developer._id });
    res.status(200).json(publicDeveloper(developer, profile?.toObject() || {}));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeveloperProfile = async (req, res) => {
  try {
    if (req.accountRole !== "developer" || String(req.account._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "You can only update your own developer profile." });
    }
    const profile = await DevProfile.findOneAndUpdate(
      { developer: req.params.id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    const developer = await Developer.findById(req.params.id);
    if (!developer) return res.status(404).json({ message: "Developer not found." });
    res.status(200).json(publicDeveloper(developer, profile.toObject()));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    if (req.accountRole !== "company" || String(req.account._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "You can only access your own company profile." });
    }
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found." });
    const profile = await CompanyProfile.findOneAndUpdate(
      { company: company._id },
      { $setOnInsert: { about: company.description } },
      { upsert: true, new: true }
    );
    res.status(200).json({ ...publicCompany(company, profile?.toObject() || {}), companyProfile: profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    if (req.accountRole !== "company" || String(req.account._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "You can only update your own company profile." });
    }
    const profile = await CompanyProfile.findOneAndUpdate(
      { company: req.params.id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found." });
    res.status(200).json({ ...publicCompany(company, profile.toObject()), companyProfile: profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const accountName = async (id, model) => {
  const account = await (model === "Company" ? Company : Developer).findById(id).lean();
  return model === "Company" ? account?.companyName || "Company" : account?.name || "Developer";
};

const publicChat = async (chat, accountId, accountRole) => {
  const companyId = chat.fromModel === "Company" ? chat.from : chat.toModel === "Company" ? chat.to : null;
  const developerId = chat.fromModel === "Developer" ? chat.from : chat.toModel === "Developer" ? chat.to : null;
  const companyName = companyId ? await accountName(companyId, "Company") : "Company";
  const developerName = developerId ? await accountName(developerId, "Developer") : "Developer";
  const messages = chat.messages.map((message) => ({
    id: message._id,
    from: String(message.from) === String(accountId) && message.fromModel === modelName(accountRole) ? accountRole : message.fromModel === "Company" ? "company" : "dev",
    fromId: message.from,
    toId: message.to,
    text: message.text,
    time: message.createdAt,
  }));
  return {
    id: chat._id,
    companyId,
    developerId,
    companyName,
    developerName,
    companyInitials: initials(companyName),
    devInitials: initials(developerName),
    phase: chat.phase,
    messages,
    lastMessage: messages.at(-1)?.text || "",
    time: messages.at(-1)?.time || chat.updatedAt,
    unread: 0,
  };
};

export const getChats = async (req, res) => {
  try {
    const accountId = req.account._id;
    const role = req.accountRole;
    const chats = await Chat.find({
      $or: [
        { from: accountId, fromModel: modelName(role) },
        { to: accountId, toModel: modelName(role) },
      ],
    }).sort({ updatedAt: -1 }).lean();
    res.status(200).json(await Promise.all(chats.map((chat) => publicChat(chat, accountId, role))));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { developerId, text = "" } = req.body;
    const accountId = req.account._id;
    const role = req.accountRole;
    if (role !== "company" || !developerId) {
      return res.status(400).json({ message: "A company account and developer are required." });
    }
    const developer = await Developer.findById(developerId);
    const company = await Company.findById(accountId);
    if (!developer || !company) return res.status(404).json({ message: "Account not found." });
    if (developer.verificationStatus !== "verified" || company.verificationStatus !== "verified") {
      return res.status(403).json({ message: "Both accounts must be admin verified before chatting." });
    }

    let chat = await Chat.findOne({
      $or: [
        { from: accountId, fromModel: "Company", to: developerId, toModel: "Developer" },
        { from: developerId, fromModel: "Developer", to: accountId, toModel: "Company" },
      ],
    });
    if (!chat) {
      chat = new Chat({ from: accountId, fromModel: "Company", to: developerId, toModel: "Developer" });
    }
    if (text.trim()) chat.messages.push({ from: accountId, fromModel: "Company", to: developerId, toModel: "Developer", text: text.trim() });
    await chat.save();
    res.status(201).json(await publicChat(chat.toObject(), accountId, role));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const accountId = req.account._id;
    const role = req.accountRole;
    const chat = await Chat.findById(req.params.id);
    if (!chat || !accountId || !text?.trim()) return res.status(400).json({ message: "A valid chat and message are required." });
    const senderModel = modelName(role);
    const isParticipant = (String(chat.from) === String(accountId) && chat.fromModel === senderModel) || (String(chat.to) === String(accountId) && chat.toModel === senderModel);
    if (!isParticipant) return res.status(403).json({ message: "You are not a participant in this chat." });
    const [company, developer] = await Promise.all([
      Company.findById(chat.fromModel === "Company" ? chat.from : chat.to),
      Developer.findById(chat.fromModel === "Developer" ? chat.from : chat.to),
    ]);
    if (company?.verificationStatus !== "verified" || developer?.verificationStatus !== "verified") {
      return res.status(403).json({ message: "Both accounts must be admin verified before chatting." });
    }
    const recipient = String(chat.from) === String(accountId) && chat.fromModel === senderModel
      ? { id: chat.to, model: chat.toModel }
      : { id: chat.from, model: chat.fromModel };
    chat.messages.push({ from: accountId, fromModel: senderModel, to: recipient.id, toModel: recipient.model, text: text.trim() });
    await chat.save();
    res.status(200).json(await publicChat(chat.toObject(), accountId, role));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateChatPhase = async (req, res) => {
  try {
    if (req.accountRole !== "company") return res.status(403).json({ message: "Only companies can update hiring phases." });
    const existing = await Chat.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Chat not found." });
    const ownsChat = String(existing.fromModel === "Company" ? existing.from : existing.to) === String(req.account._id);
    if (!ownsChat) return res.status(403).json({ message: "You are not a participant in this chat." });

    existing.phase = req.body.phase;
    await existing.save();
    if (req.body.phase === "Hired") {
      const developerId = existing.fromModel === "Developer" ? existing.from : existing.to;
      await Hire.findOneAndUpdate(
        { companyId: req.account._id, developerId },
        { $setOnInsert: { companyId: req.account._id, developerId, hiredAt: new Date() } },
        { upsert: true, new: true }
      );
    }
    const chat = existing.toObject();
    if (!chat) return res.status(404).json({ message: "Chat not found." });
    res.status(200).json(await publicChat(chat, req.account._id, req.accountRole));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
