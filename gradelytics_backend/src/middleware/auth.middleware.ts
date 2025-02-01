import { Elysia } from 'elysia';
import { supabase } from '../config/supabase';

export const authMiddleware = new Elysia()
  .derive(async ({ request, set }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      set.status = 401;
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      set.status = 401;
      throw new Error('Invalid token');
    }

    return { user };
  }); 