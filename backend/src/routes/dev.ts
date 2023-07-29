import * as Router from "@koa/router";
import { Photo } from "~entity/Photo";
import { User } from "~entity/User";

export const devRouter = new Router();

devRouter.get("/dev/clean", async (ctx) => {
    await Photo.remove(await Photo.find());
    await User.remove(await User.find());
    ctx.body = { success: true };
});
