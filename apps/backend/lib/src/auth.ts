import { Request, Response, NextFunction } from "express";
import { SignOptions, verify, sign } from "jsonwebtoken";
import { Algorithm } from "jsonwebtoken";

interface UserToken {
  userId: number;
}

export interface AuthenticatedRequest extends Request {
  user: UserToken;
}

const SIGNOPTIONS: SignOptions = {
  algorithm: "RS256" as Algorithm,
  expiresIn: "14 days",
  issuer: "martletplace:user",
};

export function authenticate_request(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const JWT_PUBLIC_KEY =
    process.env.JWT_PUBLIC_KEY ||
    (() => {
      throw new Error("JWT_PUBLIC_KEY is not set");
    })();

  // @ts-ignore
  let decoded: JwtPayload & UserToken;

  const authCookie = req.cookies["authorization"];
  try {
    decoded = verify(authCookie, JWT_PUBLIC_KEY, { algorithms: ["RS256"] });
  } catch (error) {
    console.error(error);
    res.status(401);
    return;
  }

  if (!decoded.userId) {
    console.error(`User object is empty: ${JSON.stringify(decoded)}`);
    res.status(401);
    return;
  }

  if (decoded.aud) {
    const path = `${req.method} ${new URL(req.url).pathname}`;
    if (decoded.aud !== path) {
      console.error(`Token valid for ${decoded.aud} but not ${path}`);
      res.status(401);
      return;
    }
  }

  req.user = decoded;

  next();
}

export function create_token(
  user: UserToken,
  pathRestriction?: string,
): string {
  const JWT_PRIVATE_KEY =
    process.env.JWT_PRIVATE_KEY ||
    (() => {
      throw new Error("JWT_PRIVATE_KEY is not set");
    })();

  const token = sign(user, JWT_PRIVATE_KEY, {
    ...SIGNOPTIONS,
    ...(pathRestriction && { audience: pathRestriction }),
  });
  return token;
}
