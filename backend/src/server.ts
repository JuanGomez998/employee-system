import { createApp } from "./app";
import { ensureDefaultAdminUser } from "./services/auth.service";

const app = createApp();
const port = Number(process.env.PORT || 3000);

const startServer = async () => {
  try {
    await ensureDefaultAdminUser();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

void startServer();