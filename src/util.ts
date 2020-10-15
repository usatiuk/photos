import deasync = require("deasync");
import { fromFile } from "hasha";
import sharp = require("sharp");

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
