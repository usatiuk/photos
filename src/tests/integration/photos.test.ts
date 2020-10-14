import { assert, expect } from "chai";
import { connect } from "config/database";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { app } from "~app";
import { Photo, IPhotoJSON } from "~entity/Photo";
import { IPhotosNewPostBody } from "~routes/photos";
import * as fs from "fs/promises";
import { constants as fsConstants } from "fs";

import {
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

        const photo = response.body.data as IPhotoJSON;

        const usedPhoto = seed.dogPhoto.toJSON();

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

        const photo = response.body.data as IPhotoJSON;

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

        const photo = response.body.data as IPhotoJSON;

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

        const photo = response.body.data as IPhotoJSON;

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

        const photo = response.body.data as IPhotoJSON;

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

        const photo = response.body.data as IPhotoJSON;

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
        
        const photo = response.body.data as IPhotoJSON;
        
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

        const photos = response.body.data as IPhotoJSON[];

        const userPhotos = [seed.dogPhoto.toJSON(), seed.catPhoto.toJSON()];

        expect(photos).to.deep.equal(userPhotos);
    });

    /*
    it("should get a shared photo", async function () {
        const response = await request(callback)
            .get(`/photos/shared/${seed.user1.username}/${seed.catPhoto.id}`)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as IPhotoJSON;

        const usedPhoto = seed.catPhoto.toJSON();

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
