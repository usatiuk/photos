import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from "typeorm";
import { config } from "../config";

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
