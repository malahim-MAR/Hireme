import mongoose from "mongoose";

const devProfileSchema = new mongoose.Schema(
  {
    developer: { type: mongoose.Schema.Types.ObjectId, ref: "Developer", required: true, unique: true },
    fullName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    about: { type: String, default: "", trim: true },
    experience: { type: String, default: "", trim: true },
    level: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    skills: { type: [String], default: [] },
    availability: { type: String, default: "", trim: true },
    education: { type: String, default: "", trim: true },
    github: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    portfolio: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const DevProfile = mongoose.model("DevProfile", devProfileSchema, "devProfiles");
export default DevProfile;
