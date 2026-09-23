import Developer from "../models/Developer.js";
import Company from "../models/Company.js";
import CompanyProfile from "../models/CompanyProfile.js";
import DevProfile from "../models/DevProfile.js";
import Hire from "../models/Hire.js";
import { issueAdminSession, issueSession, publicAccount, validAdminPassword } from "../middleware/auth.js";

const publicCompany = (company) => ({
  id: company._id,
  type: "company",
  companyName: company.companyName,
  workEmail: company.workEmail,
  phoneNumber: company.phoneNumber,
  location: company.location,
  industry: company.industry,
  website: company.website,
  employeeCount: company.employeeCount,
  description: company.description,
  verificationStatus: company.verificationStatus,
  emailVerified: company.emailVerified,
  adminNote: company.adminNote || company.adminNotes,
  adminNotes: company.adminNote || company.adminNotes,
});

const publicDeveloper = (developer) => ({
  id: developer._id,
  type: "developer",
  name: developer.name,
  email: developer.email,
  currentCompany: developer.currentCompany,
  yearsOfExperience: developer.yearsOfExperience,
  linkedinProfile: developer.linkedinProfile,
  phoneNumber: developer.phoneNumber,
  location: developer.location,
  portfolio: developer.portfolio,
  primarySkills: developer.primarySkills,
  verificationStatus: developer.verificationStatus,
  emailVerified: developer.emailVerified,
  adminNote: developer.adminNote || developer.adminNotes,
  adminNotes: developer.adminNote || developer.adminNotes,
});

const duplicateMessage = (error, fallback) => {
  if (error.code === 11000) return "An account with this email already exists.";
  return fallback || error.message;
};

const respondWithSignup = (res, role, account, status = 201) => {
  res.status(status).json({
    message: "Signup successful. Please sign in so admin can review your identity.",
    account: role === "company" ? publicCompany(account) : publicDeveloper(account),
  });
};

const findAccountByRole = (role) => {
  if (role === "company") return Company;
  if (role === "developer") return Developer;
  return null;
};

const getPublicAccount = (role, account) => (
  role === "company" ? publicCompany(account) : publicDeveloper(account)
);

const setSessionCookie = (res, token, name = "hiremeSession") => {
  res.cookie(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "Production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const developerSignup = async (req, res) => {
  try {
    const developer = await Developer.create({
      ...req.body,
      role: "developer",
      verificationToken: null,
      verificationStatus: "admin_pending",
      emailVerified: true,
    });
    await DevProfile.create({
      developer: developer._id,
      fullName: developer.name,
      email: developer.email,
      experience: `${developer.yearsOfExperience} years`,
      skills: developer.primarySkills ? developer.primarySkills.split(",").map((skill) => skill.trim()).filter(Boolean) : [],
      linkedin: developer.linkedinProfile,
      portfolio: developer.portfolio,
      city: developer.location,
    });

    respondWithSignup(res, "developer", developer);
  } catch (error) {
    res.status(400).json({ message: duplicateMessage(error, "Developer signup failed.") });
  }
};

export const developerLogin = async (req, res) => {
  try {
    const developer = await Developer.findOne({ email: req.body.email?.toLowerCase() });
    if (!developer || developer.password !== req.body.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const session = issueSession("developer", developer);
    setSessionCookie(res, session.token);
    res.status(200).json({ message: "Developer login successful.", ...session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const companySignup = async (req, res) => {
  try {
    const company = await Company.create({
      ...req.body,
      role: "company",
      verificationToken: null,
      verificationStatus: "admin_pending",
      emailVerified: true,
    });
    await CompanyProfile.create({
      company: company._id,
      about: company.description,
    });

    respondWithSignup(res, "company", company);
  } catch (error) {
    res.status(400).json({ message: duplicateMessage(error, "Company signup failed.") });
  }
};

export const companyLogin = async (req, res) => {
  try {
    const company = await Company.findOne({ workEmail: req.body.workEmail?.toLowerCase() });
    if (!company || company.password !== req.body.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const session = issueSession("company", company);
    setSessionCookie(res, session.token);
    res.status(200).json({ message: "Company login successful.", ...session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionAccount = async (req, res) => {
  res.status(200).json({ account: publicAccount(req.accountRole, req.account) });
};

export const resubmitAccountReview = async (req, res) => {
  try {
    if (req.account.verificationStatus !== "needs_info") {
      return res.status(400).json({ message: "Only accounts marked needs info can be resubmitted." });
    }

    const update = {
      verificationStatus: "admin_pending",
      adminNote: "",
      adminNotes: "",
    };

    if (req.accountRole === "company") {
      Object.assign(update, {
        description: req.body.description ?? req.account.description,
        website: req.body.website ?? req.account.website,
        industry: req.body.industry ?? req.account.industry,
        location: req.body.location ?? req.account.location,
        phoneNumber: req.body.phoneNumber ?? req.account.phoneNumber,
      });
    } else {
      Object.assign(update, {
        currentCompany: req.body.currentCompany ?? req.account.currentCompany,
        yearsOfExperience: req.body.yearsOfExperience ?? req.account.yearsOfExperience,
        linkedinProfile: req.body.linkedinProfile ?? req.account.linkedinProfile,
        phoneNumber: req.body.phoneNumber ?? req.account.phoneNumber,
        location: req.body.location ?? req.account.location,
        portfolio: req.body.portfolio ?? req.account.portfolio,
        primarySkills: req.body.primarySkills ?? req.account.primarySkills,
      });
    }

    const Model = findAccountByRole(req.accountRole);
    const account = await Model.findByIdAndUpdate(req.account._id, update, { new: true, runValidators: true });
    res.status(200).json({ message: "Information resubmitted for admin review.", account: publicAccount(req.accountRole, account) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  if (!validAdminPassword(req.body.password)) {
    return res.status(401).json({ message: "Invalid admin password." });
  }
  const session = issueAdminSession();
  setSessionCookie(res, session.token, "hiremeAdminSession");
  res.status(200).json({ message: "Admin login successful.", ...session });
};

export const getPendingAccounts = async (_req, res) => {
  try {
    const [companies, developers] = await Promise.all([
      Company.find({ verificationStatus: { $in: ["admin_pending", "needs_info", "rejected"] } }).sort({ updatedAt: -1 }),
      Developer.find({ verificationStatus: { $in: ["admin_pending", "needs_info", "rejected"] } }).sort({ updatedAt: -1 }),
    ]);

    res.status(200).json({
      companies: companies.map(publicCompany),
      developers: developers.map(publicDeveloper),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccountReview = async (req, res) => {
  try {
    const { role, id } = req.params;
    const { verificationStatus, adminNotes = "" } = req.body;
    const Model = findAccountByRole(role);

    if (!Model) return res.status(400).json({ message: "Invalid account type." });
    if (!["verified", "needs_info", "rejected", "admin_pending"].includes(verificationStatus)) {
      return res.status(400).json({ message: "Invalid review status." });
    }

    const account = await Model.findByIdAndUpdate(
      id,
      { verificationStatus, adminNote: adminNotes, adminNotes },
      { new: true, runValidators: true }
    );

    if (!account) return res.status(404).json({ message: "Account not found." });

    console.log(`[admin review] ${role} ${id} -> ${verificationStatus}. Email user with: ${adminNotes || "No notes"}`);
    res.status(200).json({
      message: "Review status updated.",
      account: getPublicAccount(role, account),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminSummary = async (_req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [hiresThisMonth, hires] = await Promise.all([
      Hire.countDocuments({ hiredAt: { $gte: startOfMonth } }),
      Hire.find({}).sort({ hiredAt: -1 }).limit(50).populate("companyId").populate("developerId").lean(),
    ]);

    res.status(200).json({
      hiresThisMonth,
      hires: hires.map((hire) => ({
        id: hire._id,
        hiredAt: hire.hiredAt,
        companyId: hire.companyId?._id,
        companyName: hire.companyId?.companyName || "Company",
        developerId: hire.developerId?._id,
        developerName: hire.developerId?.name || "Developer",
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
