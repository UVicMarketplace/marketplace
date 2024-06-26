import { generateKeyPairSync } from "crypto";
import { Request, Response, NextFunction } from "express";
import {
  AuthenticatedRequest,
  authenticate_request,
  create_token,
} from "./auth";
import { beforeEach, describe, it, expect, vi } from "vitest";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

process.env.JWT_PUBLIC_KEY = publicKey;
process.env.JWT_PRIVATE_KEY = privateKey;

describe("Token creation & authenticate request middleware", () => {
  let res: Response;
  let next: NextFunction;
  beforeEach(() => {
    res = { status: vi.fn() } as any as Response;
    next = vi.fn() as any as NextFunction;
    vi.spyOn(console, "error").mockImplementation(() => { });
  });

  it("Rejects if no cookie", () => {
    const req = {
      cookies: {},
    } as Request;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("Rejects if empty cookie", () => {
    const req = {
      cookies: { authorization: "" },
    } as Request;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("Rejects if invalid cookie", () => {
    const req = {
      cookies: { authorization: "bananas!" },
    } as Request;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("Rejects if expired cookie", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 1, 1));
    const authorization = create_token({ userId: 1 });
    vi.useRealTimers();

    const req = {
      cookies: { authorization },
    } as AuthenticatedRequest;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("Rejects if header none", () => {
    // { "typ": "JWT", "alg": "none" }, { "userId": 1, "iat": 1719383172, "exp": 1820592772, "iss": "martletplace:user" }
    // https://jwt.io/#debugger-io?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJ1c2VySWQiOjEsImlhdCI6MTcxOTM4MzE3MiwiZXhwIjoxODIwNTkyNzcyLCJpc3MiOiJtYXJ0bGV0cGxhY2U6dXNlciJ9.2i8nma2Uo9ls_WhDNR2K-getrWBJYmlJCU912kjrz9w
    const authorization =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJ1c2VySWQiOjEsImlhdCI6MTcxOTM4MzE3MiwiZXhwIjoxODIwNTkyNzcyLCJpc3MiOiJtYXJ0bGV0cGxhY2U6dXNlciJ9.2i8nma2Uo9ls_WhDNR2K-getrWBJYmlJCU912kjrz9w";

    const req = {
      cookies: { authorization },
    } as AuthenticatedRequest;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("Rejects if audience wrong", () => {
    const authorization = create_token({ userId: 1 }, "PATCH /api/user");

    const req = {
      cookies: { authorization },
      method: "GET",
      url: "http://localhost/",
    } as AuthenticatedRequest;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledTimes(0);
  });

  it("Accepts if cookie is valid", () => {
    const authorization = create_token({ userId: 1 });

    const req = {
      cookies: { authorization },
    } as AuthenticatedRequest;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: 1 });
  });

  it("Accepts if cookie is valid for audience", () => {
    const authorization = create_token({ userId: 1 }, "PATCH /api/user");

    const req = {
      cookies: { authorization },
      method: "PATCH",
      url: "http://localhost/api/user",
    } as AuthenticatedRequest;

    authenticate_request(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: 1 });
  });
});
