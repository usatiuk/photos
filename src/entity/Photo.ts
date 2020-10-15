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
    IsMimeType,
    Length,
    Matches,
    validateOrReject,
} from "class-validator";
import { config } from "~config";

export interface IPhotoJSON {
    id: number;
    user: number;
    hash: string;
    size: string;
    format: string;
    createdAt: number;
    editedAt: number;
    shotAt: number;
}

export interface IPhotoReqJSON extends IPhotoJSON {
    accessToken: string;
}

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

    @ManyToOne(() => User, (user) => user.photos, { eager: true })
    public user: User;

    public getFileName(): string {
        return `${this.user.id.toString()}-${this.hash}-${this.size}.${
            mime.extension(this.format) as string
        }`;
    }

    public getPath(): string {
        return path.join(this.user.getDataPath(), this.getFileName());
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
        } catch (e) {
            if (e.code !== "ENOENT") {
                throw e;
            }
        }
    }

    public async isUploaded(): Promise<boolean> {
        try {
            await fs.access(this.getPath(), fsConstants.F_OK);
            return true;
        } catch (e) {
            return false;
        }
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
    }

    public async getJWTToken(): Promise<string> {
        const now = new Date().getTime();
        const tokenExpiryOld = this.accessTokenExpiry.getTime();
        // If expires in more than 10 minutes then get from cache
        if (tokenExpiryOld - now - 60 * 10 * 1000 > 0) {
            return this.accessToken;
        } else {
            const token = jwt.sign(this.toJSON(), config.jwtSecret, {
                expiresIn: "1h",
                algorithm: "HS256",
            });
            this.accessToken = token;
            this.accessTokenExpiry = new Date(now + 60 * 60 * 1000);
            await this.save();
            return token;
        }
    }

    public toJSON(): IPhotoJSON {
        return {
            id: this.id,
            user: this.user.id,
            hash: this.hash,
            size: this.size,
            format: this.format,
            createdAt: this.createdAt.getTime(),
            editedAt: this.editedAt.getTime(),
            shotAt: this.shotAt.getTime(),
        };
    }

    public async toReqJSON(): Promise<IPhotoReqJSON> {
        const token = await this.getJWTToken();
        return { ...this.toJSON(), accessToken: token };
    }
}
