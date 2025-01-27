import express, { Application, Request, Response } from "express";
import { router as gatewayRoutes } from "./gateway/gateway.routes";
import { router as mockRoutes } from "./routes/mock.routes";

const app: Application = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/partner-gateway/v1", gatewayRoutes);
app.use("/mock", mockRoutes);

// Health Check
app.use("/alive", (_req: Request, res: Response): void => {
    res.status(200).send("yes");
});

export default app;