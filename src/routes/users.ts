import * as Router from "koa-router";
import { IUserJWT, User } from "~entity/User";

export const userRouter = new Router();

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

    ctx.body = { error: false, data: user.toAuthJSON() };
});

userRouter.post("/users/login", async (ctx) => {
    const request = ctx.request;

    if (!request.body) {
        ctx.throw(400);
    }
    const { username, password } = request.body as {
        username: string | undefined;
        password: string | undefined;
    };

    if (!(username && password)) {
        ctx.throw(400);
        return;
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.verifyPassword(password))) {
        ctx.throw(404, "User not found");
        return;
    }

    ctx.body = { error: false, data: user.toAuthJSON() };
});

userRouter.post("/users/signup", async (ctx) => {
    const request = ctx.request;

    if (!request.body) {
        ctx.throw(400);
    }

    const { username, password, email } = request.body as {
        username: string | undefined;
        password: string | undefined;
        email: string | undefined;
    };

    if (!(username && password && email)) {
        ctx.throw(400);
        return;
    }

    const user = new User(username, email);
    await user.setPassword(password);

    try {
        await user.save();
    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
            ctx.throw(400, "User already exists");
        }
    }

    ctx.body = { error: false, data: user.toAuthJSON() };
});

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

    const { password } = request.body as {
        password: string | undefined;
    };

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

    ctx.body = { error: false, data: user.toAuthJSON() };
});
