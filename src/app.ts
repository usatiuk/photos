import "reflect-metadata";

import * as cors from "@koa/cors";
import * as Koa from "koa";
import * as bodyParser from "koa-body";
import * as jwt from "koa-jwt";
import * as logger from "koa-logger";
import * as send from "koa-send";
import sslify, { xForwardedProtoResolver } from "koa-sslify";
import * as serve from "koa-static";
import * as path from "path";
import * as fs from "fs";

import { config, EnvType } from "~config";
import { userRouter } from "~routes/users";
import { devRouter } from "~routes/dev";
import { photosRouter } from "~routes/photos";

export const app = new Koa();

const tmpPath = path.join(config.dataDir, "tmp");

// Create both data dir if it doesn't exist and temp dir
fs.mkdirSync(tmpPath, { recursive: true });

app.use(cors());
app.use(logger());
app.use(
    bodyParser({
        multipart: true,
        formidable: { uploadDir: tmpPath },
    }),
);

if (config.env === EnvType.production) {
    app.use(sslify({ resolver: xForwardedProtoResolver }));
}
app.use(
    jwt({
        secret: config.jwtSecret,
        passthrough: true,
    }),
);

app.use(async (ctx, next) => {
    try {
        await next();
    } finally {
        if (ctx.request.files) {
            const filesVals = Object.values(ctx.request.files);
            await Promise.all(
                filesVals.map(async (f) => {
                    try {
                        await fs.promises.unlink(f.path);
                    } catch (e) {
                        if (e.code !== "ENOENT") {
                            throw e;
                        }
                    }
                }),
            );
        }
    }
});

app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            await send(ctx, "frontend/dist/index.html");
        }
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
        ctx.app.emit("error", err, ctx);
    }
});

app.use(serve("frontend/dist"));

app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(photosRouter.routes()).use(photosRouter.allowedMethods());

if (config.env === EnvType.development) {
    app.use(devRouter.routes()).use(devRouter.allowedMethods());
}

app.on("error", (err, ctx) => {
    ctx.body = {
        error: err.message,
        data: false,
    };
});
