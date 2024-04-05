import { isIn, IsIn, validateOrReject } from "class-validator";
import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm";

export enum ConfigKey {
    "signupAllowed" = "signupAllowed",
}

export interface IDBConfig {
    signupAllowed: "yes" | "no";
}

const defaultValues: Record<ConfigKey, string> = {
    signupAllowed: "no",
};

@Entity()
export class Config extends BaseEntity {
    @PrimaryColumn()
    @IsIn(Object.values(ConfigKey))
    public key: ConfigKey;

    @Column()
    public value: string;

    @BeforeInsert()
    async beforeInsertValidate(): Promise<void> {
        return validateOrReject(this);
    }

    @BeforeUpdate()
    async beforeUpdateValidate(): Promise<void> {
        return validateOrReject(this);
    }

    constructor(key: ConfigKey, value: string) {
        super();
        this.key = key;
        this.value = value;
    }
}

export async function getConfigValue(key: ConfigKey): Promise<string> {
    if (!isIn(key, Object.values(ConfigKey))) {
        throw new Error(`${key} is not valid config key`);
    }

    try {
        const pair = await Config.findOneOrFail({ key }, {});
        return pair.value;
    } catch (e) {
        return defaultValues[key];
    }
}

export async function setConfigValue(
    key: ConfigKey,
    val: string,
): Promise<void> {
    if (!isIn(key, Object.values(ConfigKey))) {
        throw new Error(`${key} is not valid config key`);
    }

    let pair = await Config.findOne({ key }, {});
    if (!pair) {
        pair = new Config(key, val);
    } else {
        pair.value = val;
    }
    await pair.save();
}
