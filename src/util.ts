import { fromFile } from "hasha";
import * as ExifReader from "exifreader";
import * as sharp from "sharp";
import * as fs from "fs/promises";
import { constants as fsConstants } from "fs";

export async function getHash(file: string): Promise<string> {
    return await fromFile(file, {
        algorithm: "md5",
    });
}

export async function getSize(file: string): Promise<string> {
    const metadata = await sharp(file).metadata();
    if (!(metadata.width && metadata.height)) {
        throw new Error(
            `The ${file} doesn't have width and height... how did we get there?`,
        );
    }
    const orientation = metadata.orientation ? metadata.orientation : 1;
    return orientation <= 4
        ? `${metadata.width}x${metadata.height}`
        : `${metadata.height}x${metadata.width}`;
}

export async function getShotDate(file: string): Promise<Date | null> {
    const tags = ExifReader.load(await fs.readFile(file));
    if (!tags || !tags["DateTimeOriginal"]) {
        return null;
    }
    const imageDate = tags["DateTimeOriginal"].description;
    if (!imageDate) {
        return null;
    }
    const dateStr = imageDate.split(" ")[0].replace(/:/g, "-");
    const date = new Date(dateStr + "T" + imageDate.split(" ")[1]);
    return date;
}

export async function resizeToJpeg(
    inPath: string,
    outPath: string,
    size: number,
): Promise<void> {
    const file = sharp(inPath);
    const metadata = await file.metadata();
    if (!(metadata.width && metadata.height)) {
        throw new Error(
            `The ${inPath} doesn't have width and height... how did we get there?`,
        );
    }
    const wider = metadata.width > metadata.height;
    const ratio = wider
        ? metadata.height / metadata.width
        : metadata.width / metadata.height;
    const newWidth = Math.floor(wider ? size : size * ratio);
    const newHeight = Math.floor(wider ? size * ratio : size);

    await sharp(inPath)
        .resize(newWidth, newHeight)
        .withMetadata()
        .jpeg({ progressive: true })
        .toFile(outPath);
}

export async function fileCheck(file: string) {
    try {
        await fs.access(file, fsConstants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
}