import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { getReview } from "./getReview";
import { createReview } from "./createReview";
import { updateReview } from "./updateReview";
import { deleteReview } from "./deleteReview";

const PORT = 8213;

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const pgp = pgPromise();
const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  console.error("DB_ENDPOINT environment variable is not set");
  process.exit(1);
}

const db = pgp(DB_ENDPOINT);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.get("/api/review/:id", (req, res) => getReview(req, res, db));
app.post("/api/review", (req, res) => createReview(req, res, db));
app.patch("/api/review/:id", (req, res) => updateReview(req, res, db));
app.delete("/api/review/:id", (req, res) => deleteReview(req, res, db));

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
