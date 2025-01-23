import { Router, Request, Response } from "express";
import axios, { AxiosError } from "axios";

const router = Router();

interface ErrorResponse {
    message: string;
    details?: unknown;
    errorCode?: string;
}

router.get("/betha/redirect-to-application1-trigger", async (_req: Request, res: Response): Promise<void> => {
    const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    try {
        const response = await fetch('http://localhost:3000/partner-gateway/v1/auth', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        res.status(response.status).json(data);
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ message: "An error occurred while processing the request." });
    }
});


router.get("/partner/auth", (_req: Request, res: Response): void => {
    res.status(200).json({
        "data": {
            "token": "dalsjkdnhçalkfjaçlksfjdçalkjf",
            "uri_redirect": "http://localhost:3000/application1"
        }
    });
});

router.get("/partner/application1", (req: Request, res: Response): void => {

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