import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { getListingById } from "./getListingById";
import { getListingsByUser } from "./getListingsByUser";
import { createListing } from "./createListing";
import { updateListing } from "./updateListing";
import { deleteListing } from "./deleteListing";

const PORT = 8212;

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

app.get("/api/listing/:id", (req, res) => getListingById(req, res, db));
app.get("/api/listings", (req, res) => getListingsByUser(req, res, db));
app.post("/api/listing", (req, res) => createListing(req, res, db));
app.patch("/api/listing/:id", (req, res) => updateListing(req, res, db));
app.delete("/api/listing/:id", (req, res) => deleteListing(req, res, db));

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, db };
