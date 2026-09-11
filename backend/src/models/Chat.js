import mongoose from "mongoose";

const fromReference = {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  refPath: "fromModel",
};

const toReference = {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  refPath: "toModel",
};

const messageSchema = new mongoose.Schema(
  {
    from: fromReference,
    fromModel: { type: String, required: true, enum: ["Developer", "Company"] },
    to: toReference,
    toModel: { type: String, required: true, enum: ["Developer", "Company"] },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true, _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    from: fromReference,
    fromModel: { type: String, required: true, enum: ["Developer", "Company"] },
    to: toReference,
    toModel: { type: String, required: true, enum: ["Developer", "Company"] },
    phase: { type: String, default: "Intro", trim: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema, "chats");
export default Chat;
