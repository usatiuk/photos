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
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { config } from "../config";
import { Photo } from "./Photo";

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
    public username: string;

    @Column({ length: 190 })
    @Index({ unique: true })
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
