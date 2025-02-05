import { Request, Response, Router } from 'express';

const router = Router();

router.use('/partner/auth', (req: Request, res: Response): void => {
    if (!req.query.database || !req.query.system || !req.query.entity) {
        res.status(400).json({
            message: 'Bad Request'
        });
    }

    res.status(200).json({
        uriRedirect: 'http://localhost:3000/mock/partner/application1',
        method: 'GET',
        headers: {
            Authorization: 'Bearer access-token-to-application1',
            Accept: 'application/json'
        }
    });
});

router.use('/partner/application1', (req: Request, res: Response): void => {
    if (req.headers.authorization !== 'Bearer access-token-to-application1') {
        res.status(401).json({
            message: 'Unauthorized'
        });
    }

    res.status(200).json({
        message: 'Welcome to Application 1'
    });
});

export { router };
