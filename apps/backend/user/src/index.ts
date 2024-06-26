import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import pgPromise from "pg-promise";
import { createUser } from "./createUser";
import { getUser } from "./getUser";
import { patchUser } from "./patchUser";
import { deleteUser } from "./deleteUser";
import { login } from "./login";
import { logout } from "./logout";
<<<<<<< HEAD
import { sendConfirmationEmail } from "./sendComfirmationEmail";
import { confirmEmail } from "./confirmEmail";
=======
>>>>>>> da4465d (Add auth to all endpoints)
import { AuthenticatedRequest, authenticate_request } from "../../lib/src/auth";
import cookieParser from "cookie-parser";

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
app.use(cookieParser());
app.use(authenticate_request);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// Define endpoints

// Login
app.post("/api/user/login", (req, res) => login(req, res, db));

// Logout
app.post("/api/user/logout", (req, res) => logout(req, res, db));

// Create user
app.post("/api/user", (req, res) => createUser(req, res, db));

// Get user
app.get("/api/user/:id", (req, res) => getUser(req, res, db));

// Patch user
<<<<<<< HEAD
app.patch("/api/user", (req, res) => patchUser(req as AuthenticatedRequest, res, db));

// Delete user
app.delete("/api/user", (req, res) => deleteUser(req as AuthenticatedRequest, res, db));

// Send Confirmation Email
app.post("/api/user/send-confirmation-email", (req, res) =>
  sendConfirmationEmail(req, res, db),
);

// Confirm Email
app.post("/api/user/confirm-email", (req, res) => confirmEmail(req, res, db));
=======
app.patch("/api/user", (req, res) =>
  patchUser(req as AuthenticatedRequest, res, db),
);

// Delete user
app.delete("/api/user", (req, res) =>
  deleteUser(req as AuthenticatedRequest, res, db),
);
>>>>>>> da4465d (Add auth to all endpoints)

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

export { app, createUser, getUser, patchUser, deleteUser };
