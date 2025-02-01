import type { Context } from 'elysia';
import { supabase } from '../config/supabase';

export const authController = {
  getUser: async ({ request, set }: Context) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      set.status = 401;
      return { error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      set.status = 401;
      return { error: error.message };
    }

    return { user };
  },

  verifyToken: async ({ request, set }: Context) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      set.status = 401;
      return { error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      set.status = 401;
      return { error: error.message };
    }

    return { valid: true, user: data.user };
  }
}; 