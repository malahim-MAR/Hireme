import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    First_Name: {
      type: String,
      required: true,
    },
    Last_Name: {
      type: String,
      required: true,
    },
    Job_Title: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    Phone: {
      type: String,
      required: true,
    },
    Company: {
      type: String,
      required: true,
    },
    Cover_Letter: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
  },
  { timestamps: true },
);

const Note = mongoose.model("Note", noteSchema, "Hireme");

export default Note;
