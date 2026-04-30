import { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.safeMessage || "An unexpected server error occurred";

  res.status(status).json({ success: false, message });
}
