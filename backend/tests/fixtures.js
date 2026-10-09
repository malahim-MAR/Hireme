import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Company from "../src/models/Company.js";
import Developer from "../src/models/Developer.js";
import DevProfile from "../src/models/DevProfile.js";
import Chat from "../src/models/Chat.js";
import { issueSession } from "../src/middleware/auth.js";

export async function setupDatabase() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([Company.init(), Developer.init(), DevProfile.init(), Chat.init()]);
  const company = await Company.create({ companyName: "Northstar Labs", workEmail: "company@example.test", password: "test-password", phoneNumber: "5550100", startYear: 2020, totalBranches: 1, location: "Lahore", employeeCount: "10-50", industry: "Software", verificationStatus: "verified" });
  const otherCompany = await Company.create({ companyName: "Another Company", workEmail: "other@example.test", password: "test-password", phoneNumber: "5550200", startYear: 2021, totalBranches: 1, location: "Karachi", employeeCount: "10-50", verificationStatus: "verified" });
  const makeDev = (name, email, verificationStatus = "verified") => Developer.create({ name, email, password: "test-password", currentCompany: "Independent", yearsOfExperience: 4, linkedinProfile: "https://example.test/profile", primarySkills: "React, Node.js", location: "Lahore", verificationStatus });
  const developer = await makeDev("Sam Taylor", "developer@example.test");
  const secondDeveloper = await makeDev("Amina Khan", "amina@example.test");
  const pendingDeveloper = await makeDev("Pending Developer", "pending@example.test", "admin_pending");
  await DevProfile.create({ developer: developer._id, fullName: developer.name, title: "Frontend engineer", about: "Building thoughtful product experiences with React and accessible interfaces.", level: "Senior", experience: "4 years", city: "Lahore", country: "Pakistan", skills: ["React", "Node.js"], availability: "Immediately" });
  await DevProfile.create({ developer: secondDeveloper._id, fullName: secondDeveloper.name, title: "Full-stack developer", about: "Reliable APIs and clean interfaces for growing teams.", level: "Mid", experience: "3 years", city: "Karachi", country: "Pakistan", skills: ["React", "MongoDB"], availability: "Within 2 weeks" });
  return {
    company, otherCompany, developer, secondDeveloper, pendingDeveloper,
    companyToken: issueSession("company", company).token,
    developerToken: issueSession("developer", developer).token,
    outsiderToken: issueSession("company", otherCompany).token,
    pendingToken: issueSession("developer", pendingDeveloper).token,
    cleanup: async () => { await mongoose.disconnect(); await mongo.stop(); },
  };
}
