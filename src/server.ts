import { Config, ConfigKey, setConfigValue } from "~entity/Config";
import { app } from "./app";
import { config } from "./config";
import { connect } from "./config/database";

async function readConfig() {
    if (process.env.SIGNUP_ALLOWED) {
        if (process.env.SIGNUP_ALLOWED === "yes") {
            await setConfigValue(ConfigKey.signupAllowed, "yes");
            console.log("Signups enabled");
        } else if (process.env.SIGNUP_ALLOWED === "no") {
            await setConfigValue(ConfigKey.signupAllowed, "no");
            console.log("Signups disabled");
        } else {
            await setConfigValue(ConfigKey.signupAllowed, "no");
            console.log("Signups disabled");
        }
    }
}

async function dumpConfig() {
    console.log("Running with config:");
    //TODO: not print sensitive values
    for (const entry of await Config.find()) {
        console.log(`${entry.key} = ${entry.value}`);
    }
}
connect()
    .then((connection) => {
        console.log(`Connected to ${connection.name}`);
        const startApp = () => {
            app.listen(config.port);
            console.log(`Listening at ${config.port}`);
        };

        readConfig()
            .then(() =>
                dumpConfig()
                    .then(() => startApp())
                    .catch((e) => console.log(e)),
            )
            .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
