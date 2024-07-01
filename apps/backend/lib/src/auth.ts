import { Request, Response, NextFunction } from "express";
import { SignOptions, verify, sign, JwtPayload } from "jsonwebtoken";
import { Algorithm } from "jsonwebtoken";

interface UserToken {
  userId: number;
}

// Ensure that AuthenticatedRequest extends the base Request type
export interface AuthenticatedRequest extends Request {
  user: UserToken;
  body: any; // Add the body property to match the base Request type
}

const SIGNOPTIONS: SignOptions = {
  algorithm: "RS256" as Algorithm,
  expiresIn: "14 days",
  issuer: "martletplace:user",
};

export function authenticate_request(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const JWT_PUBLIC_KEY =
    process.env.JWT_PUBLIC_KEY ||
    (() => {
      throw new Error("JWT_PUBLIC_KEY is not set");
    })();

  const path = `${req.method} ${req.url}`;
  const unauthenticatedRoutes = [
    "POST /api/user",
    "POST /api/user/reset-password",
    "POST /api/user/login",
    "POST /api/user/send-confirmation-email",
    "POST /api/user/confirm-email",
  ];
  if (
    unauthenticatedRoutes.includes(path) ||
    JWT_PUBLIC_KEY === "SKIP_VALIDATION"
  ) {
    next();
    return;
  }

  let decoded: JwtPayload & UserToken;

  try {
    const authCookie = req.cookies["authorization"];
    decoded = verify(authCookie, JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JwtPayload & UserToken;
  } catch (error) {
    console.error(error);
    res.status(401).send();
    return;
  }

  if (!decoded.userId) {
    console.error(`User object is empty: ${JSON.stringify(decoded)}`);
    res.status(401).send();
    return;
  }

  if (decoded.aud) {
    if (decoded.aud !== path) {
      console.error(`Token valid for ${decoded.aud} but not ${path}`);
      res.status(401).send();
      return;
    }
  }

  (req as AuthenticatedRequest).user = decoded;

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
