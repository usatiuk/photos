import * as Router from "@koa/router";
import { getConfigValue, ConfigKey } from "~entity/Config";
import { IUserAuthJSON, IUserJWT, User } from "~entity/User";
import { IAPIResponse } from "~types";

export const userRouter = new Router();

export type IUserGetRespBody = IAPIResponse<IUserAuthJSON>;
userRouter.get("/users/user", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const jwt = ctx.state.user as IUserJWT;

    const user = await User.findOne(jwt.id);

    if (!user) {
        ctx.throw(401);
        return;
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as IUserGetRespBody;
});

export interface IUserLoginBody {
    username: string | undefined;
    password: string | undefined;
}
export type IUserLoginRespBody = IAPIResponse<IUserAuthJSON>;
userRouter.post("/users/login", async (ctx) => {
    const request = ctx.request;

    if (!request.body) {
        ctx.throw(400);
    }
    const { username, password } = request.body as IUserLoginBody;

    if (!(username && password)) {
        ctx.throw(400);
        return;
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.verifyPassword(password))) {
        ctx.throw(404, "User not found");
        return;
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as IUserLoginRespBody;
});

export interface IUserSignupBody {
    username: string | undefined;
    password: string | undefined;
    email: string | undefined;
}
export type IUserSignupRespBody = IAPIResponse<IUserAuthJSON>;
userRouter.post("/users/signup", async (ctx) => {
    const request = ctx.request;

    if (!request.body) {
        ctx.throw(400);
    }

    const { username, password, email } = request.body as IUserSignupBody;

    if (!(username && password && email)) {
        ctx.throw(400);
        return;
    }

    const user = new User(username, email);
    const users = await User.find();

    if (users.length === 0) {
        user.isAdmin = true;
    }
    if ((await getConfigValue(ConfigKey.signupAllowed)) !== "yes") {
        if (users.length !== 0) {
            ctx.throw(400, "Signups not allowed");
        }
    }

    await user.setPassword(password);

    try {
        await user.save();
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            ctx.throw(400, "User already exists");
        }
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as IUserSignupRespBody;
});

export interface IUserEditBody {
    password: string | undefined;
}
export type IUserEditRespBody = IAPIResponse<IUserAuthJSON>;
userRouter.post("/users/edit", async (ctx) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const jwt = ctx.state.user as IUserJWT;
    const user = await User.findOne(jwt.id);
    const request = ctx.request;

    if (!user) {
        ctx.throw(401);
        return;
    }

    if (!request.body) {
        ctx.throw(400);
        return;
    }

    const { password } = request.body as IUserEditBody;

    if (!password) {
        ctx.throw(400);
        return;
    }

    await user.setPassword(password);

    try {
        await user.save();
    } catch (e) {
        ctx.throw(400);
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as IUserEditRespBody;
});
