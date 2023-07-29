import * as Router from "@koa/router";
import { Photo } from "~entity/Photo";
import {
    IPhotoReqJSON,
    IPhotosNewRespBody,
    IPhotosNewPostBody,
    IPhotoByIDDeleteRespBody,
    IPhotosUploadRespBody,
    IPhotosListRespBody,
    IPhotosByIDGetRespBody,
    IPhotosDeleteRespBody,
    IPhotosDeleteBody,
 IAPIResponse, IPhotosListPagination } from "~/shared/types";
import send = require("koa-send");
import { getHash, getSize } from "~util";
import * as jwt from "jsonwebtoken";
import { config } from "~config";
import { ValidationError } from "class-validator";
import { In } from "typeorm";

export const photosRouter = new Router();

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
        if (
            e.name === "ValidationError" ||
            (Array.isArray(e) && e.some((e) => e instanceof ValidationError))
        ) {
            ctx.throw(400);
            return;
        }
        console.log(e);
        ctx.throw(500);
    }

    ctx.body = {
        error: false,
        data: await photo.toReqJSON(),
    } as IPhotosNewRespBody;
});

photosRouter.post("/photos/upload/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;
    const photo = await Photo.findOne({ id: parseInt(id), user });
    if (!photo) {
        ctx.throw(404);
        return;
    }

    if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
        ctx.throw(400, "No file");
        return;
    }

    if (photo.uploaded) {
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
        if (Array.isArray(file)) {
            throw "more than one file uploaded";
        }

        const photoHash = await getHash(file.filepath);
        const photoSize = await getSize(file.filepath);

        if (photoHash !== photo.hash || photoSize !== photo.size) {
            ctx.throw(400, "Wrong photo");
            return;
        }

        try {
            // TODO: actually move file if it's on different filesystems
            await photo.processUpload(file.filepath);
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

photosRouter.get("/photos/list", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { user } = ctx.state;

    let { skip, num } = ctx.request.query as {
        skip: string | number | undefined;
        num: string | number | undefined;
    };

    if (typeof num === "string") {
        num = parseInt(num);
    }

    if (typeof skip === "string") {
        skip = parseInt(skip);
    }

    if (!num || num > IPhotosListPagination) {
        num = IPhotosListPagination;
    }

    const photos = await Photo.find({
        where: { user },
        take: num,
        skip: skip,
        order: { shotAt: "DESC" },
    });

    const photosList: IPhotoReqJSON[] = await Promise.all(
        photos.map(async (photo) => await photo.toReqJSON()),
    );

    ctx.body = {
        error: false,
        data: photosList,
    } as IPhotosListRespBody;
});

photosRouter.get("/photos/byID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });

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
        id: string | undefined;
        token: string | undefined;
    };

    if (!(id && token)) {
        ctx.throw(400);
        return;
    }

    try {
        jwt.verify(token, config.jwtSecret);
    } catch (e) {
        ctx.throw(401);
    }

    const photoReqJSON = jwt.decode(token) as IPhotoReqJSON;
    const { user } = photoReqJSON;

    const photo = await Photo.findOne({
        id: parseInt(id),
        user: { id: user },
    });

    if (!photo) {
        ctx.throw(404);
        return;
    }

    if (
        ctx.request.query["size"] &&
        typeof ctx.request.query["size"] == "string"
    ) {
        const size = ctx.request.query["size"];
        await send(ctx, await photo.getReadyPath(size));
        return;
    }

    await send(ctx, await photo.getReadyPath("original"));
});

photosRouter.get("/photos/showByID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });

    if (!photo) {
        ctx.throw(404);
        return;
    }

    if (
        ctx.request.query["size"] &&
        typeof ctx.request.query["size"] == "string"
    ) {
        const size = ctx.request.query["size"];
        await send(ctx, await photo.getReadyPath(size));
        return;
    }

    await send(ctx, await photo.getReadyPath("original"));
});

export type IPhotoShowToken = string;
export type IPhotosGetShowTokenByID = IAPIResponse<IPhotoShowToken>;
photosRouter.get("/photos/getShowByIDToken/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });
    if (!photo) {
        ctx.throw(404);
        return;
    }

    const token = await photo.getJWTToken();

    ctx.body = { error: false, data: token } as IPhotosGetShowTokenByID;
});

photosRouter.delete("/photos/byID/:id", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });

    if (!photo) {
        ctx.throw(404);
        return;
    }

    await photo.remove();

    ctx.body = {
        error: false,
        data: true,
    } as IPhotoByIDDeleteRespBody;
});

photosRouter.post("/photos/delete", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const body = ctx.request.body as IPhotosDeleteBody;
    const { photos } = body;

    if (!photos || !Array.isArray(photos) || photos.length == 0) {
        ctx.throw(400);
        return;
    }

    const { user } = ctx.state;
    try {
        await Photo.delete({
            id: In(photos.map((photo) => photo.id)),
            user,
        });

        ctx.body = {
            error: false,
            data: true,
        } as IPhotosDeleteRespBody;
    } catch (e) {
        ctx.body = {
            data: null,
            error: "Internal server error",
        } as IPhotosDeleteRespBody;
    }
});
