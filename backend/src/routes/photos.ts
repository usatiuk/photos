import * as Router from "@koa/router";
import { Photo } from "~entity/Photo";
import {
    TPhotoReqJSON,
    TPhotosNewRespBody,
    TPhotoByIDDeleteRespBody,
    TPhotosUploadRespBody,
    TPhotosListRespBody,
    TPhotosByIDGetRespBody,
    TPhotosDeleteRespBody,
    PhotosListPagination,
    PhotosNewPostBody,
    PhotoJSON,
    TPhotosGetShowTokenByIDRespBody,
    PhotosDeleteBody,
} from "~/shared/types";
import send = require("koa-send");
import { getHash, getSize } from "~util";
import * as jwt from "jsonwebtoken";
import { config } from "~config";
import { ValidationError } from "class-validator";
import { In } from "typeorm";
import { IAppContext, IAppState } from "~app";

export const photosRouter = new Router<IAppState, IAppContext>();

// Typescript requires explicit type annotations for CFA......
type ContextType = Parameters<
    Parameters<(typeof photosRouter)["post"]>["2"]
>["0"];

photosRouter.post("/photos/new", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { user } = ctx.state;
    const body = PhotosNewPostBody.parse(ctx.request.body);
    const { hash, size, format } = body;

    const photo = Photo.create({ user, hash, size, format });

    try {
        await photo.save();
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            const photo = await Photo.findOne({ hash, size, user });
            if (!photo) {
                ctx.throw(404);
            }

            ctx.body = {
                error: false,
                data: await photo.toReqJSON(),
            } as TPhotosNewRespBody;
            return;
        }
        if (
            e.name === "ValidationError" ||
            (Array.isArray(e) && e.some((e) => e instanceof ValidationError))
        ) {
            ctx.throw(400);
        }
        console.log(e);
        ctx.throw(500);
    }

    ctx.body = {
        error: false,
        data: await photo.toReqJSON(),
    } as TPhotosNewRespBody;
});

photosRouter.post("/photos/upload/:id", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;
    const photo = await Photo.findOne({ id: parseInt(id), user });
    if (!photo) {
        ctx.throw(404);
    }

    if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
        ctx.throw(400, "No file");
    }

    if (photo.uploaded) {
        ctx.throw(400, "Already uploaded");
    }

    if (ctx.request.files) {
        const files = ctx.request.files;
        if (Object.keys(files).length > 1) {
            ctx.throw(400, "Too many files");
        }

        const file = Object.values(files)[0];
        if (Array.isArray(file)) {
            throw "more than one file uploaded";
        }

        const photoHash = await getHash(file.filepath);
        const photoSize = await getSize(file.filepath);

        if (photoHash !== photo.hash || photoSize !== photo.size) {
            ctx.throw(400, "Wrong photo");
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
    } as TPhotosUploadRespBody;
});

/**
export interface TPhotosByIDPatchBody {     
}
export type TPhotosByIDPatchRespBody = IAPIResponse<TPhotoReqJSON>;
photosRouter.patch("/photos/byID/:id", async (ctx: ContextType) => {
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

photosRouter.get("/photos/list", async (ctx: ContextType) => {
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

    if (!num || num > PhotosListPagination) {
        num = PhotosListPagination;
    }

    const photos = await Photo.find({
        where: { user },
        take: num,
        skip: skip,
        order: { shotAt: "DESC" },
    });

    const photosList: TPhotoReqJSON[] = await Promise.all(
        photos.map(async (photo) => await photo.toReqJSON()),
    );

    ctx.body = {
        error: false,
        data: photosList,
    } as TPhotosListRespBody;
});

photosRouter.get("/photos/byID/:id", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });

    if (!photo) {
        ctx.throw(404);
    }

    ctx.body = {
        error: false,
        data: await photo.toReqJSON(),
    } as TPhotosByIDGetRespBody;
});

photosRouter.get("/photos/showByID/:id/:token", async (ctx: ContextType) => {
    const { id, token } = ctx.params as {
        id: string | undefined;
        token: string | undefined;
    };

    if (!(id && token)) {
        ctx.throw(400);
    }

    try {
        jwt.verify(token, config.jwtSecret);
    } catch (e) {
        ctx.throw(401);
    }

    const photoReqJSON = PhotoJSON.parse(jwt.decode(token));
    const { user } = photoReqJSON;

    const photo = await Photo.findOne({
        id: parseInt(id),
        user: { id: user },
    });

    if (!photo) {
        ctx.throw(404);
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

photosRouter.get("/photos/showByID/:id", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });

    if (!photo) {
        ctx.throw(404);
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

photosRouter.get("/photos/getShowByIDToken/:id", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });
    if (!photo) {
        ctx.throw(404);
    }

    const token = await photo.getJWTToken();

    ctx.body = { error: false, data: token } as TPhotosGetShowTokenByIDRespBody;
});

photosRouter.delete("/photos/byID/:id", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { id } = ctx.params as {
        id: string | undefined;
    };

    if (!id) {
        ctx.throw(400);
    }

    const { user } = ctx.state;

    const photo = await Photo.findOne({ id: parseInt(id), user });

    if (!photo) {
        ctx.throw(404);
    }

    await photo.remove();

    ctx.body = {
        error: false,
        data: true,
    } as TPhotoByIDDeleteRespBody;
});

photosRouter.post("/photos/delete", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const body = PhotosDeleteBody.parse(ctx.request.body);
    const { photos } = body;

    const { user } = ctx.state;
    try {
        await Photo.delete({
            id: In(photos.map((photo) => photo.id)),
            user,
        });

        ctx.body = {
            error: false,
            data: true,
        } as TPhotosDeleteRespBody;
    } catch (e) {
        ctx.body = {
            data: null,
            error: "Internal server error",
        } as TPhotosDeleteRespBody;
    }
});
