import { assert, expect } from "chai";
import { connect } from "config/database";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { app } from "~app";
import { User } from "~entity/User";
import {
    TUserEditBody,
    TUserEditRespBody,
    TUserGetRespBody,
    TUserLoginBody,
    TUserLoginRespBody,
    TUserSignupBody,
    TUserSignupRespBody,
} from "~shared/types";

import { allowSignups, ISeed, seedDB } from "./util";

const callback = app.callback();

let seed: ISeed;

describe("users", function () {
    before(async function () {
        await connect();
    });

    after(async function () {
        await getConnection().close();
    });

    beforeEach(async function () {
        seed = await seedDB();
    });

    it("should get user", async function () {
        const response = await request(callback)
            .get("/users/user")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as TUserGetRespBody;

        if (body.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: _, ...user } = body.data;

        expect(user).to.deep.equal(seed.user1.toJSON());
    });

    it("should login user", async function () {
        const response = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1" } as TUserLoginBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as TUserLoginRespBody;

        if (body.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: _, ...user } = response.body.data;
        expect(user).to.deep.equal(seed.user1.toJSON());
    });

    it("should not login user with wrong password", async function () {
        const response = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "asdf" } as TUserLoginBody)
            .expect(404);

        const body = response.body as TUserLoginRespBody;
        expect(body.error).to.be.equal("User not found");
        expect(body.data).to.be.null;
    });

    it("should signup user", async function () {
        await allowSignups();

        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser1",
                password: "NUser1",
                email: "nuser1@users.com",
            } as TUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as TUserSignupRespBody;

        if (body.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: _, ...user } = body.data;
        const newUser = await User.findOneOrFail({ username: "NUser1" });
        expect(user).to.deep.equal(newUser.toJSON());
    });

    it("should not signup user if other exist (by default)", async function () {
        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser1",
                password: "NUser1",
                email: "nuser1@users.com",
            } as TUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(400);

        const body = response.body as TUserSignupRespBody;

        expect(body.error).to.be.equal("Signups not allowed");
        expect(body.data).to.be.null;
    });

    it("should signup first user and it should be admin, do not signup new users (by default)", async function () {
        await User.remove(await User.find());

        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser1",
                password: "NUser1",
                email: "nuser1@users.com",
            } as TUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as TUserSignupRespBody;

        if (body.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: _, ...user } = body.data;
        const newUser = await User.findOneOrFail({ username: "NUser1" });
        expect(user).to.deep.equal(newUser.toJSON());
        expect(user.isAdmin).to.be.true;

        const response2 = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser2",
                password: "NUser2",
                email: "nuser2@users.com",
            } as TUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(400);

        const body2 = response2.body as TUserSignupRespBody;

        expect(body2.error).to.be.equal("Signups not allowed");
        expect(body2.data).to.be.null;
    });

    it("should signup first user and it should be admin, but not new ones", async function () {
        await allowSignups();
        await User.remove(await User.find());

        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser1",
                password: "NUser1",
                email: "nuser1@users.com",
            } as TUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as TUserSignupRespBody;

        if (body.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: jwt1, ...user } = body.data;
        const newUser = await User.findOneOrFail({ username: "NUser1" });
        expect(user).to.deep.equal(newUser.toJSON());
        expect(user.isAdmin).to.be.true;

        const response2 = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser2",
                password: "NUser2",
                email: "nuser2@users.com",
            } as TUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body2 = response2.body as TUserSignupRespBody;

        if (body2.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: jwt2, ...user2 } = body2.data;
        const newUser2 = await User.findOneOrFail({ username: "NUser2" });
        expect(user2).to.deep.equal(newUser2.toJSON());
        expect(user2.isAdmin).to.be.false;
    });

    it("should not signup user with duplicate username", async function () {
        await allowSignups();

        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "User1",
                password: "NUser1",
                email: "user1@users.com",
            } as TUserSignupBody)
            .expect(400);

        const body = response.body as TUserSignupRespBody;

        expect(body.error).to.be.equal("User already exists");
        expect(body.data).to.be.null;
    });

    it("should change user's password", async function () {
        const response = await request(callback)
            .post("/users/edit")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                password: "User1NewPass",
            } as TUserEditBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as TUserEditRespBody;

        if (body.error !== false) {
            assert(false);
        }

        const loginResponse = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "User1",
                password: "User1NewPass",
            } as TUserLoginBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const loginBody = loginResponse.body as TUserLoginRespBody;

        if (loginBody.error !== false) {
            assert(false);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt: _, ...user } = loginBody.data;
        expect(user).to.deep.equal(seed.user1.toJSON());

        const badLoginResponse = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1" } as TUserLoginBody)
            .expect(404);

        const badLoginBody = badLoginResponse.body as TUserLoginRespBody;

        expect(badLoginBody.error).to.be.equal("User not found");
        expect(badLoginBody.data).to.be.null;
    });
});
