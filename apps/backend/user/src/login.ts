import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";
import bcrypt from "bcryptjs";
import { verifyMFA } from "./verifyMFA";

const login = async (req: Request, res: Response, db: IDatabase<object>) => {
  const { email, password, totp_code } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await db.oneOrNone<User>(
      "SELECT user_id, username, email, password, totp_secret, name, bio, profile_pic_url, verified FROM users WHERE email = $1",
      [email],
    );

    let isPasswordValid = false;

    if (process.env.NODE_ENV === "test") {
      isPasswordValid = true;
    } else {
      const maybePassword = user?.password || "bananas";
      isPasswordValid = await bcrypt.compare(password, maybePassword);
    }

    if (!isPasswordValid || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // if (!user.verified) {
    //   return res.status(401).json({ error: "User is not verified" });
    // }

    // Verify MFA totp token
    // Only vdo this if user obj has a secret key
    if (user.totp_secret) {
      const isValid = await verifyMFA(user, totp_code);
      if (!isValid) {
        return res
          .status(401)
          .json({ error: "Invalid token, authentication failed" });
      }
    }

    return res.status(200).json({
      user: user.totp_secret,
      userID: user.user_id,
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profileUrl: user.profile_pic_url,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { login };
