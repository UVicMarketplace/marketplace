import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import bcrypt from "bcryptjs";
import { enableMFA } from "./enableMFA";

// createUser route
const createUser = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { username, password, email, name } = req.body;

  if (!username || !password || !email || !name) {
    return res
      .status(400)
      .json({ error: "Username, password, name and email are required" });
  }

  const hasDigit = /(?=.*\d)/.test(password);
  const hasLowercase = /(?=.*[a-z])/.test(password);
  const hasUppercase = /(?=.*[A-Z])/.test(password);
  const hasSpecialChar = /(?=.*\W)/.test(password);
  const hasMinLength = password.length >= 8;

  if (
    !hasDigit ||
    !hasLowercase ||
    !hasUppercase ||
    !hasSpecialChar ||
    !hasMinLength
  ) {
    return res
      .status(400)
      .json({ error: "Password does not meet constraints" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (username, email, password, name, verified)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING user_id, username, email, name, bio, profile_pic_url;
  `;

  const values = [username, email, hashedPassword, name, false];

  // Insert user into database
  try {
    const user = await db.oneOrNone(query, values);

    if (!user) {
      return res.status(500).json({ error: "User not created" });
    }

    // Create MFA token prior to returning user
    const totp_secret = await enableMFA(email, res, db);
    user.totp_secret = totp_secret;

    return res.status(201).send(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { createUser };
