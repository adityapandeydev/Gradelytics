import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import authRoutes from './routes/auth.routes';
import calculatorRoutes from './routes/calculator.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';

const app = new Elysia()
  .use(cors())
  .use(errorMiddleware)
  .use(rateLimitMiddleware)
  .group('/api', app => app
    .use(authRoutes)
    .use(calculatorRoutes)
  )
  .listen(3000);

console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`); 