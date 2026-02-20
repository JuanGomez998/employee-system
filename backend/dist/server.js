"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const auth_service_1 = require("./services/auth.service");
const app = (0, app_1.createApp)();
const port = Number(process.env.PORT || 3000);
const startServer = async () => {
    try {
        await (0, auth_service_1.ensureDefaultAdminUser)();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Failed to initialize server:", error);
        process.exit(1);
    }
};
void startServer();
