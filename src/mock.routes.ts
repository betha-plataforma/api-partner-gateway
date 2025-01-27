import { Router, Request, Response } from "express";
import AppConstants from "./app-constants";

const router = Router();

router.use("/betha/redirect-to-application1-trigger", async (_req: Request, res: Response): Promise<void> => {
    const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const response = await fetch('http://localhost:3000/partner-gateway/v1/auth', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            [AppConstants.BTH_GATEWAY_ID_HEADER]: jwtToken,
        }
    });

    const data = await response.json();

    res.status(response.status).json(data);
});


router.use("/partner/auth", (_req: Request, res: Response): void => {
    res.status(200).json({
        "uriRedirect": "http://localhost:3000/mock/partner/application1",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer access-token-to-application1",
            "Accept": "application/json"
        }
    });
});

router.use("/partner/application1", (req: Request, res: Response): void => {
    if (req.headers.authorization !== "Bearer access-token-to-application1") {
        res.status(401).json({
            "message": "Unauthorized"
        });
    }

    res.status(200).json({
        "message": "Welcome to Application 1"
    });
});

export { router };