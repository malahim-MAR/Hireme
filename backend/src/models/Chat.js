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
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    clientMessageId: { type: String, maxlength: 100 },
    readAt: { type: Date, default: null },
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
    pairKey: { type: String },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

chatSchema.index({ pairKey: 1 }, { unique: true, sparse: true });
chatSchema.index({ from: 1, fromModel: 1, updatedAt: -1 });
chatSchema.index({ to: 1, toModel: 1, updatedAt: -1 });

const Chat = mongoose.model("Chat", chatSchema, "chats");
export default Chat;
