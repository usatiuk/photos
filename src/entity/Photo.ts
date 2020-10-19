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

export const ThumbSizes = ["512", "1024", "2048"];

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

    @Column({ type: "set", enum: ThumbSizes, default: [] })
    public generatedThumbs: string[];

    @Column({ type: "varchar", length: 500 })
    public accessToken: string;

    @Column({ type: "timestamp", default: null })
    public accessTokenExpiry: Date;

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

    private getThumbFileName(size: number): string {
        return `${this.user.id.toString()}-${this.hash}-${this.size}-${size}.${
            mime.extension("image/jpeg") as string
        }`;
    }

    public getPath(): string {
        return path.join(this.user.getDataPath(), this.getFileName());
    }

    private getThumbPath(size: number): string {
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
                    async (size) =>
                        await fs.unlink(this.getThumbPath(parseInt(size))),
                ),
            );
        } catch (e) {
            if (e.code !== "ENOENT") {
                throw e;
            }
        }
    }

    // Checks if file exists and updates the DB
    public async fileExists(): Promise<boolean> {
        if (await fileCheck(this.getPath())) {
            if (!this.uploaded) {
                this.uploaded = true;
                await this.save();
            }
            return true;
        } else {
            if (this.uploaded) {
                this.uploaded = false;
                this.generatedThumbs = [];
                await this.save();
            }
            return false;
        }
    }

    public async processUpload(): Promise<void> {
        await this.fileExists();
        const date = await getShotDate(this.getPath());
        if (date !== null) {
            this.shotAt = date;
        } else {
            this.shotAt = new Date();
        }
        await this.save();
    }

    private async generateThumbnail(size: number): Promise<void> {
        if (!(await this.fileExists())) {
            return;
        }
        await resizeToJpeg(this.getPath(), this.getThumbPath(size), size);
        this.generatedThumbs.push(size.toString());
        await this.save();
    }

    public async getReadyThumbnailPath(size: number): Promise<string> {
        if (!ThumbSizes.includes(size.toString())) {
            throw new Error("Wrong thumbnail size");
        }
        const path = this.getThumbPath(size);
        if (
            !this.generatedThumbs.includes(size.toString()) ||
            !(await fileCheck(path))
        ) {
            await this.generateThumbnail(size);
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
        const tokenExpiryOld = this.accessTokenExpiry.getTime();
        // If expires in more than 10 minutes then get from cache
        if (tokenExpiryOld - now - 60 * 10 * 1000 > 0) {
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
            shotAt: this.shotAt.getTime(),
            uploaded: this.uploaded,
        };
    }

    public async toReqJSON(): Promise<IPhotoReqJSON> {
        const token = await this.getJWTToken();
        return { ...(await this.toJSON()), accessToken: token };
    }
}
