import { app } from "./app";
import { config } from "./config";
import { connect } from "./config/database";

connect()
    .then((connection) => {
        console.log(`Connected to ${connection.name}`);
        app.listen(config.port);
        console.log(`Listening at ${config.port}`);
    })
    .catch((e) => console.log(e));
