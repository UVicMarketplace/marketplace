import { Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";

import { encode } from "hi-base32";
import crypto from "crypto";

const enableMFA = async (
  email: string,
  res: Response,
  db: IDatabase<object>,
) => {
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await db.oneOrNone<User>(
    "SELECT user_id, username, email, password, totp_secret, name, bio, profile_pic_url, verified FROM users WHERE email = $1",
    [email],
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.totp_secret) {
    return res.status(400).json({ error: "MFA is already enabled" });
  }

  // Generate secret key for user
  const secret_key = generateBase32Secret();
  user.totp_secret = secret_key;

  // Store secret key in database
  const query = `
        UPDATE users
        SET totp_secret = $1
        WHERE email = $2;
    `;

  const values = [secret_key, email];

  try {
    await db.none(query, values);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not store secret in db" });
  }

  // Generate QR code for user
  // const totp = new OTPAuth.TOTP({
  //   label: "Martletplace",
  //   algorithm: "SHA1",
  //   digits: 6,
  //   secret: secret_key,
  // });

  // const otpauthURL = totp.toString();

  // Export QR to file for testing
  // const options: QRCode.QRCodeToFileOptions = {
  //     errorCorrectionLevel: 'L', // Error correction level
  //     type: 'png',               // File type
  //     width: 300,                // Width of the QR code
  //     margin: 1,                 // Margin around the QR code
  //     color: {
  //         dark: '#000000',       // Color of the QR code
  //         light: '#FFFFFF'       // Background color
  //     }
  // }
  // await QRCode.toFile('qr.png', otpauthURL, options);

  // Return secret key
  return secret_key;
  // return res.status(200).json({
  //   secret: secret_key,
  // });
};

const generateBase32Secret = () => {
  const buffer = crypto.randomBytes(15);
  const base32secret = encode(buffer).toString().replace(/=/g, "");
  return base32secret.substring(0, 24);
};

export { enableMFA };
