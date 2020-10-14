import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs/promises";
import {
    AfterInsert,
    AfterRemove,
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
import {
    IsAlphanumeric,
    IsBase32,
    IsBase64,
    IsEmail,
    IsHash,
    validateOrReject,
} from "class-validator";

export type IUserJSON = Pick<User, "id" | "username">;

export interface IUserJWT extends IUserJSON {
    ext: number;
    iat: number;
}

export interface IUserAuthJSON extends IUserJSON {
    jwt: string;
}

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
        await fs.mkdir(this.getDataPath());
    }

    @BeforeRemove()
    async removeDataDir(): Promise<void> {
        await fs.rmdir(this.getDataPath(), { recursive: true });
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
        const { id, username } = this;
        return { id, username };
    }

    public toAuthJSON(): IUserAuthJSON {
        const { id, username } = this;
        return { id, username, jwt: this.toJWT() };
    }

    public toJWT(): string {
        return jwt.sign(this.toJSON(), config.jwtSecret, { expiresIn: "31d" });
    }
}
