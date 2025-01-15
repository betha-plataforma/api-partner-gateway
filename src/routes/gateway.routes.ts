import { Router, Request, Response } from "express";

const router = Router();

router.post("/auth", (_req: Request, res: Response): void => {
    res.status(200).send("redirected");
});

export { router };