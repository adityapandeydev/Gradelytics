import { supabase } from '../config/supabase';
import type { Calculation } from '../types';

export const calculatorController = {
  saveCalculation: async ({ body, user }: { body: Partial<Calculation>, user: any }) => {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .insert([{ user_id: user.id, ...body }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(`Failed to save calculation: ${error.message}`);
    }
  },

  getHistory: async ({ user, getCache, setCache }: { 
    user: any, 
    getCache: (key: string) => any,
    setCache: (key: string, data: any) => void 
  }) => {
    try {
      const cacheKey = `history:${user.id}`;
      const cachedData = getCache(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCache(cacheKey, data);
      return data;
    } catch (error: any) {
      throw new Error(`Failed to fetch history: ${error.message}`);
    }
  },

  deleteCalculation: async ({ params, user }: { params: { id: string }, user: any }) => {
    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete calculation: ${error.message}`);
    }
  }
}; 