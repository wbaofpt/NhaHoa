import type { Request, Response, NextFunction } from "express";
export function protectWrites(origins: Set<string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store");
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    if (
      req.get("Sec-Fetch-Site") === "cross-site" ||
      (req.headers.origin && !origins.has(req.headers.origin))
    )
      return res.status(403).json({ error: "Nguồn yêu cầu không được phép." });
    // Cross-origin forms cannot set this custom header. Do not enable permissive CORS.
    if (req.get("X-NhaHoa-Request") !== "web")
      return res
        .status(403)
        .json({ error: "Yêu cầu thiếu thông tin xác thực nguồn." });
    if (!req.is("application/json"))
      return res.status(415).json({ error: "Yêu cầu phải dùng JSON." });
    next();
  };
}
