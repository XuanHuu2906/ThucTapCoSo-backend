import app from './app.js';
import { env } from './config/env.js';
import { startScheduler } from './services/scheduler.service.js';

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`Ready to accept connections at http://localhost:${env.PORT}`);

      // UC-12: Khởi động scheduler gửi email nhắc nhở đánh giá thử việc
      if (env.NODE_ENV !== 'test') {
        startScheduler();
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
