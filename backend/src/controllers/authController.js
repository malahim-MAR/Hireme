import Developer from "../models/Developer.js";
import Company from "../models/Company.js";
import CompanyProfile from "../models/CompanyProfile.js";
import DevProfile from "../models/DevProfile.js";

const publicCompany = (company) => ({
  id: company._id,
  type: "company",
  companyName: company.companyName,
  workEmail: company.workEmail,
  verificationStatus: company.verificationStatus,
  emailVerified: company.emailVerified,
  adminNotes: company.adminNotes,
});

const publicDeveloper = (developer) => ({
  id: developer._id,
  type: "developer",
  name: developer.name,
  email: developer.email,
  verificationStatus: developer.verificationStatus,
  emailVerified: developer.emailVerified,
  adminNotes: developer.adminNotes,
});

const duplicateMessage = (error, fallback) => {
  if (error.code === 11000) return "An account with this email already exists.";
  return fallback || error.message;
};

const respondWithSignup = (res, role, account, status = 201) => {
  res.status(status).json({
    message: "Signup successful. You can now sign in.",
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

export const developerSignup = async (req, res) => {
  try {
    const developer = await Developer.create({
      ...req.body,
      verificationToken: null,
      verificationStatus: "verified",
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

    res.status(200).json({ message: "Developer login successful.", account: publicDeveloper(developer) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const companySignup = async (req, res) => {
  try {
    const company = await Company.create({
      ...req.body,
      verificationToken: null,
      verificationStatus: "verified",
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

    res.status(200).json({ message: "Company login successful.", account: publicCompany(company) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingAccounts = async (_req, res) => {
  try {
    const [companies, developers] = await Promise.all([
      Company.find({ verificationStatus: { $in: ["admin_pending", "needs_info"] } }).sort({ updatedAt: -1 }),
      Developer.find({ verificationStatus: { $in: ["admin_pending", "needs_info"] } }).sort({ updatedAt: -1 }),
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
      { verificationStatus, adminNotes },
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
