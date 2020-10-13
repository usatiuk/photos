import { assert, expect } from "chai";
import { connect } from "config/database";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { app } from "~app";
import { IUserAuthJSON, User } from "~entity/User";
import {
    IUserEditBody,
    IUserEditRespBody,
    IUserGetRespBody,
    IUserLoginBody,
    IUserLoginRespBody,
    IUserSignupBody,
    IUserSignupRespBody,
} from "~routes/users";

import { ISeed, seedDB } from "./util";

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

        const body = response.body as IUserGetRespBody;

        if (body.error !== false) {
            assert(false);
            return;
        }

        const { jwt: _, ...user } = body.data;

        expect(user).to.deep.equal(seed.user1.toJSON());
    });

    it("should login user", async function () {
        const response = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1" } as IUserLoginBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as IUserLoginRespBody;

        if (body.error !== false) {
            assert(false);
            return;
        }

        const { jwt: _, ...user } = response.body.data;
        expect(user).to.deep.equal(seed.user1.toJSON());
    });

    it("should not login user with wrong password", async function () {
        const response = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "asdf" } as IUserLoginBody)
            .expect(404);

        const body = response.body as IUserLoginRespBody;
        expect(body.error).to.be.equal("User not found");
        expect(body.data).to.be.false;
    });

    it("should signup user", async function () {
        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser1",
                password: "NUser1",
                email: "nuser1@users.com",
            } as IUserSignupBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as IUserSignupRespBody;

        if (body.error !== false) {
            assert(false);
            return;
        }

        const { jwt: _, ...user } = body.data;
        const newUser = await User.findOneOrFail({ username: "NUser1" });
        expect(user).to.deep.equal(newUser.toJSON());
    });

    it("should not signup user with duplicate username", async function () {
        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "User1",
                password: "NUser1",
                email: "user1@users.com",
            } as IUserSignupBody)
            .expect(400);

        const body = response.body as IUserSignupRespBody;

        expect(body.error).to.be.equal("User already exists");
        expect(body.data).to.be.false;
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
            } as IUserEditBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const body = response.body as IUserEditRespBody;

        if (body.error !== false) {
            assert(false);
            return;
        }

        const loginResponse = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "User1",
                password: "User1NewPass",
            } as IUserLoginBody)
            .expect("Content-Type", /json/)
            .expect(200);

        const loginBody = loginResponse.body as IUserLoginRespBody;

        if (loginBody.error !== false) {
            assert(false);
            return;
        }

        const { jwt: _, ...user } = loginBody.data;
        expect(user).to.deep.equal(seed.user1.toJSON());

        const badLoginResponse = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1" } as IUserLoginBody)
            .expect(404);

        const badLoginBody = badLoginResponse.body as IUserLoginRespBody;

        expect(badLoginBody.error).to.be.equal("User not found");
        expect(badLoginBody.data).to.be.false;
    });
});
