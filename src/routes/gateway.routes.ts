import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response): void => {
    res.status(301).send("redirected");
});

export { router };