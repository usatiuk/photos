import * as Router from "koa-router";
import { User } from "~entity/User";

export const devRouter = new Router();

devRouter.post("/dev/clean", async (ctx) => {
    await User.remove(await User.find());
    ctx.body = { success: true };
});
