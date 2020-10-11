import { expect } from "chai";
import { connect } from "config/database";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { app } from "~app";
import { IUserAuthJSON, User } from "~entity/User";

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

        expect(response.body.error).to.be.false;

        const { jwt: _, ...user } = response.body.data as IUserAuthJSON;

        expect(user).to.deep.equal(seed.user1.toJSON());
    });

    it("should login user", async function () {
        const response = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1" })
            .expect("Content-Type", /json/)
            .expect(200);

        expect(response.body.error).to.be.false;

        const { jwt: _, ...user } = response.body.data as IUserAuthJSON;

        expect(user).to.deep.equal(seed.user1.toJSON());
    });

    it("should not login user with wrong password", async function () {
        const response = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "asdf" })
            .expect(404);

        expect(response.body.error).to.be.equal("User not found");
        expect(response.body.data).to.be.false;
    });

    it("should signup user", async function () {
        const response = await request(callback)
            .post("/users/signup")
            .set({ "Content-Type": "application/json" })
            .send({
                username: "NUser1",
                password: "NUser1",
                email: "nuser1@users.com",
            })
            .expect("Content-Type", /json/)
            .expect(200);

        expect(response.body.error).to.be.false;

        const { jwt: _, ...user } = response.body.data as IUserAuthJSON;

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
            })
            .expect(400);

        expect(response.body.error).to.be.equal("User already exists");
        expect(response.body.data).to.be.false;
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
            })
            .expect("Content-Type", /json/)
            .expect(200);

        expect(response.body.error).to.be.false;

        const loginResponse = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1NewPass" })
            .expect("Content-Type", /json/)
            .expect(200);

        expect(loginResponse.body.error).to.be.false;

        const { jwt: _, ...user } = response.body.data as IUserAuthJSON;
        expect(user).to.deep.equal(seed.user1.toJSON());

        const badLoginResponse = await request(callback)
            .post("/users/login")
            .set({ "Content-Type": "application/json" })
            .send({ username: "User1", password: "User1" })
            .expect(404);

        expect(badLoginResponse.body.error).to.be.equal("User not found");
        expect(badLoginResponse.body.data).to.be.false;
    });
});
