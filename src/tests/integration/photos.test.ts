import { assert, expect } from "chai";
import { connect } from "config/database";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { app } from "~app";
import { Photo, IPhotoReqJSON } from "~entity/Photo";
import { IPhotosListRespBody, IPhotosNewPostBody } from "~routes/photos";
import * as fs from "fs/promises";
import { constants as fsConstants } from "fs";
import * as jwt from "jsonwebtoken";

import {
    catFileSize,
    catPath,
    dogFileSize,
    dogFormat,
    dogHash,
    dogPath,
    dogSize,
    ISeed,
    prepareMetadata,
    seedDB,
} from "./util";
import { sleep } from "deasync";
import { config } from "~config";

const callback = app.callback();

let seed: ISeed;

describe("photos", function () {
    before(async function () {
        await connect();
        await prepareMetadata();
    });

    after(async function () {
        await getConnection().close();
    });

    beforeEach(async function () {
        seed = await seedDB();
    });

    it("should get a photo", async function () {
        const response = await request(callback)
            .get(`/photos/byID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        const usedPhoto = seed.dogPhoto.toReqJSON();

        expect(photo).to.deep.equal(usedPhoto);
    });

    it("should not get a photo without jwt", async function () {
        const response = await request(callback)
            .get(`/photos/byID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(404);

        expect(response.body.error).to.be.equal("Not Found");
    });

    it("should show a photo", async function () {
        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);
        expect(parseInt(response.header["content-length"])).to.equal(
            dogFileSize,
        );
    });

    it("should show a photo using access token", async function () {
        const listResp = await request(callback)
            .get(`/photos/list`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        const listRespBody = listResp.body as IPhotosListRespBody;

        if (listRespBody.error !== false) {
            expect(listResp.body.error).to.be.false;
            return;
        }

        const photos = listRespBody.data;
        expect(photos.length).to.be.equal(2);

        const listAnyResp = await request(callback)
            .get(`/photos/showByID/${photos[0].id}/${photos[0].accessToken}`)
            .expect(200);
        expect(parseInt(listAnyResp.header["content-length"])).to.be.oneOf([
            dogFileSize,
            catFileSize,
        ]);

        const getTokenResp = await request(callback)
            .get(`/photos/getShowByIDToken/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        expect(getTokenResp.body.error).to.be.false;
        const token = getTokenResp.body.data as string;

        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}/${token}`)
            .expect(200);
        expect(parseInt(response.header["content-length"])).to.equal(
            dogFileSize,
        );

        const tokenSelfSigned = jwt.sign(
            seed.dogPhoto.toReqJSON(),
            config.jwtSecret,
            {
                expiresIn: "1m",
            },
        );

        const responseSS = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}/${tokenSelfSigned}`)
            .expect(200);
        expect(parseInt(responseSS.header["content-length"])).to.equal(
            dogFileSize,
        );
    });

    it("should not show a photo using expired access token", async function () {
        const token = jwt.sign(seed.dogPhoto.toReqJSON(), config.jwtSecret, {
            expiresIn: "0s",
        });

        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}/${token}`)
            .expect(401);
    });

    it("should not show a photo without jwt", async function () {
        const response = await request(callback)
            .get(`/photos/byID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(404);

        expect(response.body.error).to.be.equal("Not Found");
    });

    it("should create, upload and show a photo", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: seed.user1.id as any,
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);

        expect(await dbPhoto.isUploaded()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(200);

        expect(await dbPhoto.isUploaded()).to.be.equal(true);

        const showResp = await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(200);

        expect(parseInt(showResp.header["content-length"])).to.equal(
            dogFileSize,
        );
    });

    it("should not create a photo twice", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const response2 = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(400);
    });

    it("should not upload a photo twice", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: seed.user1.id as any,
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);

        expect(await dbPhoto.isUploaded()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(200);

        expect(await dbPhoto.isUploaded()).to.be.equal(true);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(400);

        const showResp = await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(200);

        expect(parseInt(showResp.header["content-length"])).to.equal(
            dogFileSize,
        );
    });

    it("should not upload a wrong photo", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: seed.user1.id as any,
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);

        expect(await dbPhoto.isUploaded()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", catPath)
            .expect(400);

        expect(await dbPhoto.isUploaded()).to.be.equal(false);

        const showResp = await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(404);
    });

    it("should create a photo but not upload for other user", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: seed.user1.id as any,
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);
        expect(await dbPhoto.isUploaded()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(404);

        expect(await dbPhoto.isUploaded()).to.be.equal(false);
    });

    it("should create, upload but not show a photo to another user", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: seed.user1.id as any,
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);
        expect(await dbPhoto.isUploaded()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(200);

        expect(await dbPhoto.isUploaded()).to.be.equal(true);

        await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(404);
    });

    it("should not create a photo with weird properties", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: "../test",
                size: "33333",
                format: dogFormat,
            } as IPhotosNewPostBody)
            .expect(400);
    });

    /*
    it("should update a photo", async function () {
        const response = await request(callback)
        .patch(`/photos/byID/${seed.dogPhoto.id}`)
        .set({
            Authorization: `Bearer ${seed.user1.toJWT()}`,
            "Content-Type": "application/json",
        })
        .send({ name: "Test1", content: "Test1" })
        .expect(200);
        
        expect(response.body.error).to.be.false;
        
        const photo = response.body.data as IPhotoReqJSON;
        
        expect(photo.name).to.be.equal("Test1");
        
        const dbPhoto = await Photo.findOne({
            id: seed.dogPhoto.id,
            user: seed.user1.id as any,
        });
        
        expect(dbPhoto.name).to.be.equal("Test1");
        expect(dbPhoto.editedAt.getTime()).to.be.closeTo(
            new Date().getTime(),
            2000,
            );
        });
    */

    it("should list photos", async function () {
        const response = await request(callback)
            .get("/photos/list")
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        expect(response.body.error).to.be.false;

        const photos = response.body.data as IPhotoReqJSON[];

        const userPhotos = [
            seed.dogPhoto.toReqJSON(),
            seed.catPhoto.toReqJSON(),
        ];

        expect(photos).to.deep.equal(userPhotos);
    });

    /*
    it("should get a shared photo", async function () {
        const response = await request(callback)
            .get(`/photos/shared/${seed.user1.username}/${seed.catPhoto.id}`)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoReqJSON;

        const usedPhoto = seed.catPhoto.toReqJSON();

        expect(photo).to.deep.equal(usedPhoto);
    });
    */

    it("should delete a photo", async function () {
        const photoPath = seed.dogPhoto.getPath();
        const response = await request(callback)
            .delete(`/photos/byID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        expect(response.body.error).to.be.false;
        const dbPhoto = await Photo.findOne(seed.dogPhoto.id);
        expect(dbPhoto).to.be.undefined;

        try {
            await fs.access(photoPath, fsConstants.F_OK);
            assert(false);
        } catch (e) {
            assert(true);
        }
    });
});