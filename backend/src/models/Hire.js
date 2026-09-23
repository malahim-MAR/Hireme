import mongoose from "mongoose";

const hireSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Developer",
      required: true,
    },
    hiredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Hire = mongoose.model("Hire", hireSchema, "hires");
export default Hire;
