import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { createUser } from "./createUser";
import { getUser } from "./getUser";
import { patchUser } from "./updateUser";
import { deleteUser } from "./deleteUser";

const PORT = 8211;

const app = express();
const pgp = pgPromise();
const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  console.error("DB_ENDPOINT environment variable is not set");
  process.exit(1);
}

const db = pgp(DB_ENDPOINT);

app.use(morgan("dev"));
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// Define endpoints

// Create user
app.post("/api/user", (req, res) => createUser(req, res, db));

// Get user
app.get("/api/user/:id", (req, res) => getUser(req, res, db));

// Patch user
app.patch("/api/user/:id", (req, res) => patchUser(req, res, db));

// Delete user
app.delete("/api/user/:id", (req, res) => deleteUser(req, res, db));

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, createUser, getUser, patchUser, deleteUser };
