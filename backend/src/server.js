import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/ratelimiter.js";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const __dirname = path.resolve();
console.log(__dirname);

app.use(express.json());

if (process.env.NODE_ENV !== "Production") {
  app.use(
    cors({
      origin: [/^http:\/\/localhost:517\d$/],
    })
  );
}
// app.use(rateLimiter);
app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", marketplaceRoutes);

if (process.env.NODE_ENV == "Production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// app.get('/api/notes', (req, res) => {
//     res.send("Running Server Successfully");
// }
// )
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
});
