import express from "express";
import "dotenv/config";
import path from "path";
const app = express();
const PORT = process.env.PORT || 3500;
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
import rootRoute from "./routes/root.mjs";
import errorHandler from "./middleware/errorHandler.mjs";
import logger from "./middleware/logger.mjs";
import connectDB from "./config/dbConn.mjs";
import corsOptions from "./config/corsOptions.mjs";
import mongoose from "mongoose";

connectDB();
app.use(logger.logger);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/", rootRoute);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not found");
  }
});
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logger.logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrorLog.log"
  );
});
