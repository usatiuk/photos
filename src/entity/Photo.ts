import * as path from "path";
import * as fs from "fs/promises";
import * as mime from "mime-types";
import { constants as fsConstants } from "fs";
import * as jwt from "jsonwebtoken";

import {
    AfterRemove,
    BaseEntity,
    BeforeInsert,
    BeforeRemove,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import {
    isAlphanumeric,
    IsAlphanumeric,
    IsHash,
    IsIn,
    IsMimeType,
    isNumber,
    Length,
    Matches,
    validateOrReject,
} from "class-validator";
import { config } from "~config";
import { fileCheck, getShotDate, resizeToJpeg } from "~util";

export interface IPhotoJSON {
    id: number;
    user: number;
    hash: string;
    size: string;
    format: string;
    createdAt: number;
    editedAt: number;
    shotAt: number;
    uploaded: boolean;
}

export interface IPhotoReqJSON extends IPhotoJSON {
    accessToken: string;
}

export const thumbSizes = ["512", "1024", "2048", "original"];
export type ThumbSize = typeof thumbSizes[number];

@Entity()
@Index(["hash", "size", "user"], { unique: true })
export class Photo extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 190 })
    @Index()
    @IsHash("md5")
    public hash: string;

    @Column({ length: 190 })
    @IsAlphanumeric()
    @Matches(/\d*x\d*/)
    public size: string;

    @Column({ length: 190 })
    @IsMimeType()
    public format: string;

    @Column({ default: false })
    public uploaded: boolean;

    @Column({ type: "set", enum: thumbSizes, default: [] })
    public generatedThumbs: ThumbSize[];

    @Column({ type: "varchar", length: 500 })
    public accessToken: string;

    @Column({ type: "timestamp", default: null })
    public accessTokenExpiry: Date | null;

    @Column({ type: "timestamp", default: null })
    public shotAt: Date;

    @Column({ type: "timestamp", default: null })
    public createdAt: Date;

    @Column({ type: "timestamp", default: null })
    public editedAt: Date;

    @ManyToOne(() => User, (user) => user.photos, {
        eager: true,
        onDelete: "CASCADE",
    })
    public user: User;

    public getFileName(): string {
        return `${this.user.id.toString()}-${this.hash}-${this.size}.${
            mime.extension(this.format) as string
        }`;
    }

    private getThumbFileName(size: ThumbSize): string {
        return `${this.user.id.toString()}-${this.hash}-${this.size}-${size}.${
            mime.extension("image/jpeg") as string
        }`;
    }

    public getPath(): string {
        return path.join(this.user.getDataPath(), this.getFileName());
    }

    public getThumbPath(size: ThumbSize): string {
        return path.join(this.user.getDataPath(), this.getThumbFileName(size));
    }

    @BeforeInsert()
    async beforeInsertValidate(): Promise<void> {
        return validateOrReject(this);
    }

    @BeforeUpdate()
    async beforeUpdateValidate(): Promise<void> {
        return validateOrReject(this);
    }

    @BeforeRemove()
    async cleanupFiles(): Promise<void> {
        try {
            await fs.unlink(this.getPath());
            await Promise.all(
                this.generatedThumbs.map(
                    async (size) => await fs.unlink(this.getThumbPath(size)),
                ),
            );
        } catch (e) {
            if (e.code !== "ENOENT" && e.code !== "NotFoundError") {
                throw e;
            }
        }
    }

    // Checks if file exists
    public async origFileExists(): Promise<boolean> {
        if (await fileCheck(this.getPath())) {
            return true;
        } else {
            return false;
        }
    }

    public async processUpload(origFile: string): Promise<void> {
        await fs.rename(origFile, this.getPath());
        this.uploaded = true;
        const date = await getShotDate(this.getPath());
        if (date !== null) {
            this.shotAt = date;
        } else {
            this.shotAt = new Date();
        }
        await this.save();
    }

    private async generateThumbnail(size: ThumbSize): Promise<void> {
        if (!(await this.origFileExists())) {
            await this.remove();
            throw new Error("Photo file not found");
        }
        await resizeToJpeg(
            this.getPath(),
            this.getThumbPath(size),
            parseInt(size),
        );
        this.generatedThumbs.push(size);
        await this.save();
    }

    public async getReadyPath(size: ThumbSize): Promise<string> {
        if (!thumbSizes.includes(size)) {
            throw new Error("Wrong thumbnail size");
        }
        const path =
            size === "original" ? this.getPath() : this.getThumbPath(size);
        if (
            size !== "original" &&
            (!this.generatedThumbs.includes(size.toString()) ||
                !(await fileCheck(path)))
        ) {
            await this.generateThumbnail(size);
        }
        if (size === "original") {
            if (!(await fileCheck(path))) {
                await this.remove();
                throw new Error("Photo file not found");
            }
        }
        return path;
    }

    constructor(user: User, hash: string, size: string, format: string) {
        super();
        this.createdAt = new Date();
        this.editedAt = this.createdAt;
        this.shotAt = this.createdAt;
        this.accessTokenExpiry = this.createdAt;
        this.accessToken = "";
        this.hash = hash;
        this.format = format;
        this.size = size;
        this.user = user;
        this.generatedThumbs = [];
    }

    public async getJWTToken(): Promise<string> {
        const now = new Date().getTime();
        const tokenExpiryOld = this.accessTokenExpiry?.getTime();
        // If expires in more than 10 minutes then get from cache
        if (tokenExpiryOld && tokenExpiryOld - now - 60 * 10 * 1000 > 0) {
            return this.accessToken;
        } else {
            const token = jwt.sign(await this.toJSON(), config.jwtSecret, {
                expiresIn: "1h",
                algorithm: "HS256",
            });
            this.accessToken = token;
            this.accessTokenExpiry = new Date(now + 60 * 60 * 1000);
            await this.save();
            return token;
        }
    }

    public async toJSON(): Promise<IPhotoJSON> {
        if (!isNumber(this.user.id)) {
            throw new Error("User not loaded");
        }
        return {
            id: this.id,
            user: this.user.id,
            hash: this.hash,
            size: this.size,
            format: this.format,
            createdAt: this.createdAt.getTime(),
            editedAt: this.editedAt.getTime(),
            // workaround weird bug where this.shotAt is null
            shotAt: this.shotAt
                ? this.shotAt.getTime()
                : this.createdAt.getTime(),
            uploaded: this.uploaded,
        };
    }

    public async toReqJSON(): Promise<IPhotoReqJSON> {
        const token = await this.getJWTToken();
        return { ...(await this.toJSON()), accessToken: token };
    }
}
