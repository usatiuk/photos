import * as Router from "@koa/router";
import { getConfigValue, ConfigKey } from "~entity/Config";
import { User } from "~entity/User";
import {
    TUserJWT,
    TUserGetRespBody,
    TUserEditRespBody,
    TUserSignupBody,
    TUserSignupRespBody,
    TUserLoginRespBody,
    TUserEditBody,
    TUserLoginBody,
    UserLoginBody,
    UserSignupBody,
    UserEditBody,
} from "~/shared/types";
import { IAppContext, IAppState } from "~app";

export const userRouter = new Router<IAppState, IAppContext>();

type ContextType = Parameters<
    Parameters<(typeof userRouter)["post"]>["2"]
>["0"];

userRouter.get("/users/user", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const jwt = ctx.state.user;
    const user = await User.findOne(jwt.id);

    if (!user) {
        ctx.throw(401);
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as TUserGetRespBody;
});

userRouter.post("/users/login", async (ctx: ContextType) => {
    const request = ctx.request;

    if (!request.body) {
        ctx.throw(400);
    }
    const { username, password } = UserLoginBody.parse(request.body);

    const user = await User.findOne({ username });
    if (!user || !(await user.verifyPassword(password))) {
        ctx.throw(404, "User not found");
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as TUserLoginRespBody;
});

userRouter.post("/users/signup", async (ctx: ContextType) => {
    const request = ctx.request;

    if (!request.body) {
        ctx.throw(400);
    }

    const { username, password, email } = UserSignupBody.parse(request.body);

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
        console.log(e);
        ctx.throw(500);
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as TUserSignupRespBody;
});

userRouter.post("/users/edit", async (ctx: ContextType) => {
    if (!ctx.state.user) {
        ctx.throw(401);
    }

    const jwt = ctx.state.user;
    const user = await User.findOne(jwt.id);
    const request = ctx.request;

    if (!user) {
        ctx.throw(401);
    }

    if (!request.body) {
        ctx.throw(400);
    }

    const { password } = UserEditBody.parse(request.body);

    if (!password) {
        ctx.throw(400);
    }

    await user.setPassword(password);

    try {
        await user.save();
    } catch (e) {
        console.log(e);
        ctx.throw(500);
    }

    ctx.body = { error: false, data: user.toAuthJSON() } as TUserEditRespBody;
});
