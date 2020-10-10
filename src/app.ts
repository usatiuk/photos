import * as Koa from "koa";

export const app = new Koa();

app.use(async (ctx) => {
    ctx.body = "hello!";
});
