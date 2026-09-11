import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
    about: { type: String, default: "", trim: true },
    hiringHistory: { type: [String], default: [] },
    totalHires: { type: Number, default: 0, min: 0 },
    openRoles: { type: Number, default: 0, min: 0 },
    preferredStacks: { type: [String], default: [] },
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema, "companyProfiles");
export default CompanyProfile;
