import * as Router from "@koa/router";
import { Photo } from "~entity/Photo";
import { User } from "~entity/User";
import { IAppContext, IAppState } from "~app";

export const devRouter = new Router<IAppState, IAppContext>();

type ContextType = Parameters<Parameters<(typeof devRouter)["post"]>["2"]>["0"];

devRouter.get("/dev/clean", async (ctx: ContextType) => {
    await Photo.remove(await Photo.find());
    await User.remove(await User.find());
    ctx.body = { success: true };
});
