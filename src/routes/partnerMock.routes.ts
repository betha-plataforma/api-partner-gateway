import { Router, Request, Response } from "express";

const router = Router();

router.get("/auth", (_req: Request, res: Response): void => {
    res.status(200).json({
        "data": {
            "token": "dalsjkdnhçalkfjaçlksfjdçalkjf",
            "uri_redirect": "http://localhost:3000/application1"
        }
    });
});

router.get("/application1", (req: Request, res: Response): void => {

    if (req.headers.authorization !== "dalsjkdnhçalkfjaçlksfjdçalkjf") {
        res.status(401).json({
            "message": "Unauthorized"
        });
    }

    res.status(200).json({
        "message": "Welcome to Application 1"
    });
});

export { router };