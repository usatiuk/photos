import deasync = require("deasync");
import { fromFile } from "hasha";
import * as ExifReader from "exifreader";
import * as sharp from "sharp";
import * as fs from "fs/promises";

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
    return `${metadata.width}x${metadata.height}`;
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

export async function resizeTo(
    inPath: string,
    outPath: string,
    size: number,
): Promise<void> {
    await sharp(inPath).resize(size, size).withMetadata().toFile(outPath);
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const getHashSync: (file: string) => string = deasync(getHash);
// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const getSizeSync: (file: string) => string = deasync(getSize);
