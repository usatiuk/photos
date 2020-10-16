import * as fs from "fs/promises";

import { User } from "entity/User";
import { Photo } from "~entity/Photo";
import { getHash, getSize } from "~util";

export const dogPath = "./src/tests/integration/photos/dog.jpg";
export const catPath = "./src/tests/integration/photos/cat.jpg";
export const pngPath = "./src/tests/integration/photos/ee.png";

export interface ISeed {
    user1: User;
    user2: User;
    dogPhoto: Photo;
    catPhoto: Photo;
}

export let dogHash = "";
export let dogSize = "";
export let dogFileSize = 0;
export const dogFormat = "image/jpeg";
export let catHash = "";
export let catSize = "";
export let catFileSize = 0;
export const catFormat = "image/jpeg";
export let pngHash = "";
export let pngSize = "";
export let pngFileSize = 0;
export const pngFormat = "image/png";

export async function prepareMetadata(): Promise<void> {
    dogHash = await getHash(dogPath);
    dogSize = await getSize(dogPath);
    dogFileSize = (await fs.stat(dogPath)).size;
    catHash = await getHash(catPath);
    catSize = await getSize(catPath);
    catFileSize = (await fs.stat(catPath)).size;
    pngHash = await getHash(pngPath);
    pngSize = await getSize(pngPath);
    pngFileSize = (await fs.stat(pngPath)).size;
}

export async function seedDB(): Promise<ISeed> {
    dogHash = await getHash(dogPath);
    dogSize = await getSize(dogPath);
    catHash = await getHash(catPath);
    catSize = await getSize(catPath);

    await Photo.remove(await Photo.find());
    await User.remove(await User.find());

    const user1 = new User("User1", "user1@users.com");
    await user1.setPassword("User1");
    await user1.save();

    const user2 = new User("User2", "user2@users.com");
    await user2.setPassword("User2");
    await user2.save();

    const dogPhoto = new Photo(user2, dogHash, dogSize, dogFormat);
    const catPhoto = new Photo(user2, catHash, catSize, catFormat);

    await fs.copyFile(dogPath, dogPhoto.getPath());
    await fs.copyFile(catPath, catPhoto.getPath());

    await dogPhoto.save();
    await catPhoto.save();

    return { user1, user2, dogPhoto, catPhoto };
}
