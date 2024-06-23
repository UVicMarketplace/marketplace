import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { getMessageThreads } from "./getMessageThreads";
import { getMessages } from "./getMessages";
import { createMessage } from "./createMessage";

const PORT = 8214;

const app = express();
app.use(morgan("dev"));
app.use(express.json());

const pgp = pgPromise();
const DB_ENDPOINT = process.env.DB_ENDPOINT || "";

const db = pgp(DB_ENDPOINT);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.get("/api/messages/overview", getMessageThreads);
app.get("/api/messages/thread/:listing_id/:receiver_id", getMessages);
app.post("/api/messages/thread/:listing_id/:receiver_id", createMessage);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
