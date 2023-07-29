import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs/promises";
import { IUserJSON, IUserAuthJSON } from "~/shared/types";

import {
    AfterInsert,
    BaseEntity,
    BeforeInsert,
    BeforeRemove,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { config } from "../config";
import { Photo } from "./Photo";
import { IsAlphanumeric, IsEmail, validateOrReject } from "class-validator";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 190 })
    @Index({ unique: true })
    @IsAlphanumeric()
    public username: string;

    @Column({ length: 190 })
    @Index({ unique: true })
    @IsEmail()
    public email: string;

    @Column({ length: 190 })
    public passwordHash: string;

    @OneToMany(() => Photo, (photo) => photo.user)
    photos: Promise<Photo[]>;

    @Column({ default: false })
    public isAdmin: boolean;

    constructor(username: string, email: string) {
        super();
        this.username = username;
        this.email = email;
    }

    public async verifyPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }

    public async setPassword(password: string): Promise<void> {
        this.passwordHash = await bcrypt.hash(password, 10);
    }

    public getDataPath(): string {
        return path.join(config.dataDir, this.id.toString());
    }

    @AfterInsert()
    async createDataDir(): Promise<void> {
        await fs.mkdir(this.getDataPath(), { recursive: true });
    }

    @BeforeRemove()
    async removeDataDir(): Promise<void> {
        // force because otherwise it will fail if directory already doesn't exist
        await fs.rm(this.getDataPath(), { recursive: true, force: true });
    }

    @BeforeInsert()
    async beforeInsertValidate(): Promise<void> {
        return validateOrReject(this);
    }

    @BeforeUpdate()
    async beforeUpdateValidate(): Promise<void> {
        return validateOrReject(this);
    }

    public toJSON(): IUserJSON {
        const { id, username, isAdmin } = this;
        return { id, username, isAdmin };
    }

    public toAuthJSON(): IUserAuthJSON {
        const json = this.toJSON();
        return { ...json, jwt: this.toJWT() };
    }

    public toJWT(): string {
        return jwt.sign(this.toJSON(), config.jwtSecret, { expiresIn: "31d" });
    }
}
