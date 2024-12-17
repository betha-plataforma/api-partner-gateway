import express, { Application, Request, Response, NextFunction } from "express";

import { router as gatewayRoutes } from "./routes/gateway.routes";

const app: Application = express();

app.use("/", gatewayRoutes);

app.use("/alive", (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).send("yes");
});

export default app;