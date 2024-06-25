import { User } from "./models/user";
import OTPAuth from "otpauth";

const verifyMFA = async (user: User, totp_secret: string) => {
  // Create TOTP from stored secret
  const totp = new OTPAuth.TOTP({
    label: "Martletplace",
    algorithm: "SHA1",
    digits: 6,
    secret: user.totp_secret!,
  });

  const isValid = totp.validate({ token: totp_secret });

  if (isValid === 0) {
    return true;
  } else {
    return false;
  }
};

export { verifyMFA };
