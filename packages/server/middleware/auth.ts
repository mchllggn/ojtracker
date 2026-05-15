import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

const parseBearerToken = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err || !payload) {
      res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    const data = payload as JwtPayload & { userId?: number; email?: string };
    if (typeof data.userId !== "number" || typeof data.email !== "string") {
      res.status(403).json({ success: false, message: "Invalid token" });
      return;
    }

    req.user = { userId: data.userId, email: data.email };
    next();
  });
};
