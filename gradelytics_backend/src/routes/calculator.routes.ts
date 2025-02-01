import { Elysia } from 'elysia';
import { calculatorController } from '../controllers/calculator.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { CalculationSchema, DeleteParamsSchema } from '../types/requests';

const calculatorRoutes = new Elysia({ prefix: '/calculator' })
  .use(authMiddleware)
  .use(cacheMiddleware)
  .post('/save', 
    ({ body, user }) => calculatorController.saveCalculation({ body, user }), 
    { body: CalculationSchema }
  )
  .get('/history', 
    ({ user, getCache, setCache }) => 
      calculatorController.getHistory({ user, getCache, setCache })
  )
  .delete('/:id', 
    ({ params, user }) => calculatorController.deleteCalculation({ params, user }), 
    { params: DeleteParamsSchema }
  );

export default calculatorRoutes; 