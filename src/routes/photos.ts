import * as Router from "@koa/router";
import { IPhotoJSON, Photo } from "~entity/Photo";
import { User } from "~entity/User";
import { IAPIResponse } from "~types";
import * as fs from "fs/promises";
import send = require("koa-send");
import { getHash, getSize } from "~util";

export const photosRouter = new Router();

export interface IPhotosNewPostBody {
    hash: string | undefined;
    size: string | undefined;
    format: string | undefined;
}
export type IPhotosNewRespBody = IAPIResponse<IPhotoJSON>;
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

    const photo = new Photo(user.id, hash, size, format);

    try {
        await photo.save();
    } catch (e) {
        ctx.throw(400);
    }

    ctx.body = {
        error: false,
        data: photo.toJSON(),
    } as IPhotosNewRespBody;
});

export type IPhotosUploadRespBody = IAPIResponse<IPhotoJSON>;
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
        } catch (e) {
            ctx.throw(500);
        }
    }
    ctx.body = {
        error: false,
        data: photo.toJSON(),
    } as IPhotosUploadRespBody;
});

/**
export interface IPhotosByIDPatchBody {     
}
export type IPhotosByIDPatchRespBody = IAPIResponse<IPhotoJSON>;
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
        data: photo.toJSON(),
    };
});
*/

export type IPhotosListRespBody = IAPIResponse<IPhotoJSON[]>;
photosRouter.get("/photos/list", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const { user } = ctx.state;

    const photos = await Photo.find({ user });

    ctx.body = {
        error: false,
        data: photos.map((photo) => photo.toJSON()),
    } as IPhotosListRespBody;
});

export type IPhotosByIDGetRespBody = IAPIResponse<IPhotoJSON>;
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
        data: photo.toJSON(),
    } as IPhotosByIDGetRespBody;
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

    if (!photo || !(await photo.isUploaded())) {
        ctx.throw(404);
        return;
    }

    await send(ctx, photo.getPath());
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
