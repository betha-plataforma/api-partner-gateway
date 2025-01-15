import express, { Application, Request, Response, NextFunction } from "express";

import { router as gatewayRoutes } from "./routes/gateway.routes";
import { router as partnerMock } from "./routes/partnerMock.routes";
import { router as bethaMock } from "./routes/bethaMock.routes";

const app: Application = express();

app.use("/partner-gateway/v1", gatewayRoutes);
app.use("/partner", partnerMock);
app.use("/betha", bethaMock);

app.use("/alive", (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).send("yes");
});

export default app;