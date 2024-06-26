import { assert, expect } from "chai";
import { connect } from "config/database";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { app } from "~app";
import { Photo } from "~entity/Photo";
import {
    TPhotoReqJSON,
    TPhotosDeleteBody,
    TPhotosListRespBody,
    TPhotosNewPostBody,
} from "~shared/types";
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
    pngFileSize,
    pngFormat,
    pngHash,
    pngPath,
    pngSize,
    prepareMetadata,
    seedDB,
} from "./util";
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

        const photo = response.body.data as TPhotoReqJSON;

        const usedPhoto = await seed.dogPhoto.toReqJSON();

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
        expect(parseInt(response.get("content-length") ?? "")).to.equal(
            dogFileSize,
        );
    });

    it("should delete a photo after file has been deleted", async function () {
        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);
        expect(parseInt(response.get("content-length") ?? "")).to.equal(
            dogFileSize,
        );

        await fs.unlink(await seed.dogPhoto.getReadyPath("original"));
        await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(500);
        const dbPhoto = await Photo.findOne(seed.dogPhoto.id);
        expect(dbPhoto).to.be.undefined;
    });

    it("should delete a photo after file has been deleted (thumbnail access)", async function () {
        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}?size=512`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);
        const dogSmallThumbSize = (
            await fs.stat(seed.dogPhoto.getThumbPath("512"))
        ).size;
        expect(parseInt(response.get("content-length") ?? "")).to.equal(
            dogSmallThumbSize,
        );

        await fs.unlink(await seed.dogPhoto.getReadyPath("512"));
        await fs.unlink(await seed.dogPhoto.getReadyPath("original"));
        await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}?size=512`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(500);

        const dbPhoto = await Photo.findOne(seed.dogPhoto.id);
        expect(dbPhoto).to.be.undefined;
    });

    it("should show a thumbnail", async function () {
        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}?size=512`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);
        expect(parseInt(response.get("content-length") ?? "")).to.be.lessThan(
            dogFileSize,
        );
    });

    it("should show a thumbnail after it was deleted", async function () {
        const response = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}?size=512`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);
        const dogSmallThumbSize = (
            await fs.stat(seed.dogPhoto.getThumbPath("512"))
        ).size;
        expect(parseInt(response.get("content-length") ?? "")).to.equal(
            dogSmallThumbSize,
        );

        await fs.unlink(seed.dogPhoto.getThumbPath("512"));
        await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}?size=512`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);
        const dogSmallThumbSize2 = (
            await fs.stat(seed.dogPhoto.getThumbPath("512"))
        ).size;
        expect(parseInt(response.get("content-length") ?? "")).to.equal(
            dogSmallThumbSize2,
        );
    });

    it("should show a photo using access token", async function () {
        const listResp = await request(callback)
            .get(`/photos/list`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        const listRespBody = listResp.body as TPhotosListRespBody;

        if (listRespBody.error !== false) {
            expect(listResp.body.error).to.be.false;
            return;
        }

        const photos = listRespBody.data;
        expect(photos.length).to.be.equal(2);

        const listAnyResp = await request(callback)
            .get(`/photos/showByID/${photos[0].id}/${photos[0].accessToken}`)
            .expect(200);
        expect(parseInt(listAnyResp.get("content-length") ?? "")).to.be.oneOf([
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
        expect(parseInt(response.get("content-length") ?? "")).to.equal(
            dogFileSize,
        );

        const tokenSelfSigned = jwt.sign(
            await seed.dogPhoto.toReqJSON(),
            config.jwtSecret,
            {
                expiresIn: "1m",
            },
        );

        const responseSS = await request(callback)
            .get(`/photos/showByID/${seed.dogPhoto.id}/${tokenSelfSigned}`)
            .expect(200);
        expect(parseInt(responseSS.get("content-length") ?? "")).to.equal(
            dogFileSize,
        );
    });

    it("should not show a photo using expired access token", async function () {
        const token = jwt.sign(
            await seed.dogPhoto.toReqJSON(),
            config.jwtSecret,
            {
                expiresIn: "0s",
            },
        );

        await request(callback)
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

    it("should create, upload and show a photo with a shot date", async function () {
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
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);

        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(200);

        const dbPhotoUpl = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhotoUpl.hash).to.be.equal(dogHash);
        expect(await dbPhotoUpl.origFileExists()).to.be.equal(true);
        expect(dbPhotoUpl.shotAt.toISOString()).to.be.equal(
            new Date("2020-10-05T14:20:18").toISOString(),
        );

        const showResp = await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(200);

        expect(parseInt(showResp.get("content-length") ?? "")).to.equal(
            dogFileSize,
        );
    });

    it("should create, upload and show a png file", async function () {
        const response = await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: pngHash,
                size: pngSize,
                format: pngFormat,
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        expect(photo.hash).to.be.equal(pngHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto.hash).to.be.equal(pngHash);

        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", pngPath)
            .expect(200);

        const dbPhotoUpl = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhotoUpl.hash).to.be.equal(pngHash);
        expect(dbPhotoUpl.format).to.be.equal(pngFormat);
        expect(await dbPhotoUpl.origFileExists()).to.be.equal(true);
        expect(dbPhotoUpl.shotAt.getTime()).to.be.approximately(
            new Date().getTime(),
            10000,
        );

        const showResp = await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(200);

        expect(parseInt(showResp.get("content-length") ?? "")).to.equal(
            pngFileSize,
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
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: dogHash,
                size: dogSize,
                format: dogFormat,
            } as TPhotosNewPostBody)
            .expect(200);

        const dbPhoto = await Photo.find({
            hash: dogHash,
            size: dogSize,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto).to.have.lengthOf(1);
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
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);

        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(200);

        expect(await dbPhoto.origFileExists()).to.be.equal(true);

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

        expect(parseInt(showResp.get("content-length") ?? "")).to.equal(
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
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);

        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", catPath)
            .expect(400);

        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
            })
            .expect(500);
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
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);
        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(404);

        expect(await dbPhoto.origFileExists()).to.be.equal(false);
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
            } as TPhotosNewPostBody)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        expect(photo.hash).to.be.equal(dogHash);
        const dbPhoto = await Photo.findOneOrFail({
            id: photo.id,
            user: { id: seed.user1.id },
        });
        expect(dbPhoto.hash).to.be.equal(dogHash);
        expect(await dbPhoto.origFileExists()).to.be.equal(false);

        await request(callback)
            .post(`/photos/upload/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .attach("photo", dogPath)
            .expect(200);

        expect(await dbPhoto.origFileExists()).to.be.equal(true);

        await request(callback)
            .get(`/photos/showByID/${photo.id}`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(404);
    });

    it("should not create a photo with weird properties", async function () {
        await request(callback)
            .post("/photos/new")
            .set({
                Authorization: `Bearer ${seed.user1.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                hash: "../test",
                size: "33333",
                format: dogFormat,
            } as TPhotosNewPostBody)
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
        
        const photo = response.body.data as TPhotoReqJSON;
        
        expect(photo.name).to.be.equal("Test1");
        
        const dbPhoto = await Photo.findOne({
            id: seed.dogPhoto.id,
            user: {id:seed.user1.id} ,
        });
        
        expect(dbPhoto.name).to.be.equal("Test1");
        expect(dbPhoto.editedAt.getTime()).to.be.closeTo(
            new Date().getTime(),
            2000,
            );
        });
    */

    it("should list photos, sorted", async function () {
        const response = await request(callback)
            .get("/photos/list")
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
            })
            .expect(200);

        expect(response.body.error).to.be.false;

        const photos = response.body.data as TPhotoReqJSON[];
        const userPhotos = [
            await seed.dogPhoto.toReqJSON(),
            await seed.catPhoto.toReqJSON(),
        ].sort((a, b) => b.shotAt - a.shotAt);

        const photoIds = photos.map((p) => p.id);
        const userPhotoIds = userPhotos.map((p) => p.id);

        expect(photos).to.deep.equal(userPhotos);
        expect(photoIds).to.have.ordered.members(userPhotoIds);

        //TODO: Test pagination
    });

    /*
    it("should get a shared photo", async function () {
        const response = await request(callback)
            .get(`/photos/shared/${seed.user1.username}/${seed.catPhoto.id}`)
            .expect(200);

        expect(response.body.error).to.be.false;

        const photo = response.body.data as TPhotoReqJSON;

        const usedPhoto = seed.catPhoto.toReqJSON();

        expect(photo).to.deep.equal(usedPhoto);
    });
    */

    it("should delete a photo", async function () {
        const photoPath = seed.dogPhoto.getPath();
        const photoSmallThumbPath = await seed.dogPhoto.getReadyPath("512");
        const response = await request(callback)
            .post(`/photos/delete`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                photos: [await seed.dogPhoto.toReqJSON()],
            } as TPhotosDeleteBody)
            .expect(200);

        expect(response.body.error).to.be.false;
        const dbPhoto = await Photo.findOne(seed.dogPhoto.id);
        expect(dbPhoto).to.be.undefined;

        try {
            await fs.access(photoPath, fsConstants.F_OK);
            await fs.access(photoSmallThumbPath, fsConstants.F_OK);
            assert(false);
        } catch (e) {
            assert(true);
        }
    });

    it("should delete two photos", async function () {
        const photo1Path = seed.dogPhoto.getPath();
        const photo2Path = seed.catPhoto.getPath();
        const photo1SmallThumbPath = await seed.dogPhoto.getReadyPath("512");
        const photo2SmallThumbPath = await seed.catPhoto.getReadyPath("512");
        const response = await request(callback)
            .post(`/photos/delete`)
            .set({
                Authorization: `Bearer ${seed.user2.toJWT()}`,
                "Content-Type": "application/json",
            })
            .send({
                photos: [
                    await seed.dogPhoto.toReqJSON(),
                    await seed.catPhoto.toReqJSON(),
                ],
            } as TPhotosDeleteBody)
            .expect(200);

        expect(response.body.error).to.be.false;
        const dbPhoto1 = await Photo.findOne(seed.dogPhoto.id);
        expect(dbPhoto1).to.be.undefined;
        const dbPhoto2 = await Photo.findOne(seed.catPhoto.id);
        expect(dbPhoto2).to.be.undefined;

        try {
            await fs.access(photo1Path, fsConstants.F_OK);
            await fs.access(photo1SmallThumbPath, fsConstants.F_OK);
            await fs.access(photo2Path, fsConstants.F_OK);
            await fs.access(photo2SmallThumbPath, fsConstants.F_OK);
            assert(false);
        } catch (e) {
            assert(true);
        }
    });
});
