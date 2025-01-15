import { Router, Request, Response } from "express";
import axios, { AxiosError } from "axios";

const router = Router();

interface ErrorResponse {
    message: string;
    details?: unknown;
    errorCode?: string;
}

router.get("/redirect-to-application1-trigger", async (_req: Request, res: Response): Promise<void> => {
    const jwtToken = "test_jwt_token"; // Replace with actual JWT generation or retrieval logic

    try {
        const { data, status } = await axios.post(
            'http://localhost:3000/partner-gateway/v1/auth',
            {}, // Include a body if needed
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                },
                timeout: 5000,
            },
        );

        console.log('Response data:', JSON.stringify(data, null, 4));
        console.log('Response status:', status);

        res.status(status).json(data);
    } catch (error) {
        let errorResponse: ErrorResponse;

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            errorResponse = {
                message: 'An error occurred while processing your request',
                details: axiosError.response?.data,
                errorCode: 'UNKNOWN_ERROR'
            };

            console.error('Axios error:', errorResponse);
            res.status(axiosError.response?.status || 500).json(errorResponse);
        } else {
            errorResponse = {
                message: 'An unexpected error occurred',
                errorCode: 'INTERNAL_ERROR'
            };
            console.error('Unexpected error:', errorResponse);
            res.status(500).json(errorResponse);
        }
    }
});

export { router };