import * as Router from "@koa/router";
import { IPhotoReqJSON, Photo } from "~entity/Photo";
import { User } from "~entity/User";
import { IAPIResponse } from "~types";
import * as fs from "fs/promises";
import send = require("koa-send");
import { getHash, getSize } from "~util";
import * as jwt from "jsonwebtoken";
import { config } from "~config";

export const photosRouter = new Router();

export interface IPhotosNewPostBody {
    hash: string | undefined;
    size: string | undefined;
    format: string | undefined;
}
export type IPhotosNewRespBody = IAPIResponse<IPhotoReqJSON>;
photosRouter.post("/photos/new", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { user } = ctx.state;
    const body = ctx.request.body as IPhotosNewPostBody;
    const { hash, size, format } = body;

    if (!(hash && size && format)) {
        ctx.throw(400);
        return;
    }

    const photo = new Photo(user, hash, size, format);

    try {
        await photo.save();
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            const photo = await Photo.findOne({ hash, size, user });
            if (!photo) {
                ctx.throw(404);
                return;
            }

            ctx.body = {
                error: false,
                data: await photo.toReqJSON(),
            } as IPhotosNewRespBody;
            return;
        }
        ctx.throw(400);
    }

    ctx.body = {
        error: false,
        data: await photo.toReqJSON(),
    } as IPhotosNewRespBody;
});

export type IPhotosUploadRespBody = IAPIResponse<IPhotoReqJSON>;
photosRouter.post("/photos/upload/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: number | undefined;
    };

    if (!id) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;
    const photo = await Photo.findOne({ id, user });
    if (!photo) {
        ctx.throw(404);
        return;
    }

    if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
        ctx.throw(400, "No file");
        return;
    }

    if (await photo.fileExists()) {
        ctx.throw(400, "Already uploaded");
        return;
    }

    if (ctx.request.files) {
        const files = ctx.request.files;
        if (Object.keys(files).length > 1) {
            ctx.throw(400, "Too many files");
            return;
        }
        const file = Object.values(files)[0];

        const photoHash = await getHash(file.path);
        const photoSize = await getSize(file.path);

        if (photoHash !== photo.hash || photoSize !== photo.size) {
            ctx.throw(400, "Wrong photo");
            return;
        }

        try {
            // TODO: actually move file if it's on different filesystems
            await fs.rename(file.path, photo.getPath());
            await photo.processUpload();
        } catch (e) {
            console.log(e);
            ctx.throw(500);
        }
    }
    ctx.body = {
        error: false,
        data: await photo.toReqJSON(),
    } as IPhotosUploadRespBody;
});

/**
export interface IPhotosByIDPatchBody {     
}
export type IPhotosByIDPatchRespBody = IAPIResponse<IPhotoReqJSON>;
photosRouter.patch("/photos/byID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
        return;
    }
    
    const { user } = ctx.state;
    const { id } = ctx.params as {
        id: number | undefined;
    };
    
    if (!id) {
        ctx.throw(400);
        return;
    }
    
    const photo = await Photo.findOne({ id, user });
    
    if (!photo) {
        ctx.throw(404);
        return;
    }
    
    // TODO: Some actual editing
    
    try {
        photo.editedAt = new Date();
        await photo.save();
    } catch (e) {
        ctx.throw(400);
    }
    
    ctx.body = {
        error: false,
        data: photo.toReqJSON(),
    };
});
*/

export type IPhotosListRespBody = IAPIResponse<IPhotoReqJSON[]>;
photosRouter.get("/photos/list", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { user } = ctx.state;

    const photos = await Photo.find({ user });

    const photosList: IPhotoReqJSON[] = await Promise.all(
        photos.map(async (photo) => await photo.toReqJSON()),
    );

    ctx.body = {
        error: false,
        data: photosList,
    } as IPhotosListRespBody;
});

export type IPhotosByIDGetRespBody = IAPIResponse<IPhotoReqJSON>;
photosRouter.get("/photos/byID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: number | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id, user });

    if (!photo) {
        ctx.throw(404);
        return;
    }

    ctx.body = {
        error: false,
        data: await photo.toReqJSON(),
    } as IPhotosByIDGetRespBody;
});

photosRouter.get("/photos/showByID/:id/:token", async (ctx) => {
    const { id, token } = ctx.params as {
        id: number | undefined;
        token: string | undefined;
    };

    if (!(id && token)) {
        ctx.throw(400);
        return;
    }

    try {
        jwt.verify(token, config.jwtSecret) as IPhotoReqJSON;
    } catch (e) {
        ctx.throw(401);
    }

    const photoReqJSON = jwt.decode(token) as IPhotoReqJSON;
    const { user } = photoReqJSON;

    const photo = await Photo.findOne({
        id,
        user: { id: user },
    });

    if (!photo || !(await photo.fileExists())) {
        ctx.throw(404);
        return;
    }

    if (ctx.request.query["size"]) {
        const size = parseInt(ctx.request.query["size"]);
        await send(ctx, await photo.getReadyThumbnailPath(size));
        return;
    }

    await send(ctx, photo.getPath());
});

photosRouter.get("/photos/showByID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: number | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id, user });

    if (!photo || !(await photo.fileExists())) {
        ctx.throw(404);
        return;
    }

    if (ctx.request.query["size"]) {
        const size = parseInt(ctx.request.query["size"]);
        await send(ctx, await photo.getReadyThumbnailPath(size));
        return;
    }

    await send(ctx, photo.getPath());
});

export type IPhotoShowToken = string;
export type IPhotosGetShowTokenByID = IAPIResponse<IPhotoShowToken>;
photosRouter.get("/photos/getShowByIDToken/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: number | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id, user });
    if (!photo || !(await photo.fileExists())) {
        ctx.throw(404);
        return;
    }

    const token = await photo.getJWTToken();

    ctx.body = { error: false, data: token } as IPhotosGetShowTokenByID;
});

export type IPhotosByIDDeleteRespBody = IAPIResponse<boolean>;
photosRouter.delete("/photos/byID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: number | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id, user });

    if (!photo) {
        ctx.throw(404);
        return;
    }

    await photo.remove();

    ctx.body = {
        error: false,
        data: true,
    } as IPhotosByIDDeleteRespBody;
});
