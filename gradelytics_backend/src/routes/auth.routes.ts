import { Elysia } from 'elysia';
import { authController } from '../controllers/auth.controller';

const authRoutes = new Elysia({ prefix: '/auth' })
  .get('/user', authController.getUser)
  .post('/verify', authController.verifyToken);

export default authRoutes; 