import * as path from "path";
import * as fs from "fs/promises";
import * as mime from "mime-types";
import { constants as fsConstants } from "fs";

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

export interface IPhotoJSON {
    id: number;
    user: number;
    hash: string;
    size: string;
    format: string;
    createdAt: number;
    editedAt: number;
}

@Entity()
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
        this.hash = hash;
        this.format = format;
        this.size = size;
        this.user = user;
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
        };
    }
}
