import { Elysia } from 'elysia';

export const errorMiddleware = new Elysia()
  .onError(({ code, error, set }) => {
    set.status = getStatusCode(code);
    
    switch (code) {
      case 'NOT_FOUND':
        return { error: 'Not Found' };
      
      case 'VALIDATION':
        return { error: error.message };
      
      case 'PARSE':
        return { error: 'Bad Request' };
      
      case 'INTERNAL_SERVER_ERROR':
        console.error(error);
        return { error: 'Internal Server Error' };
      
      default:
        console.error(error);
        return { error: 'Something went wrong' };
    }
  });

function getStatusCode(code: string): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404;
    case 'VALIDATION':
    case 'PARSE':
      return 400;
    case 'INVALID_COOKIE_SIGNATURE':
      return 401;
    default:
      return 500;
  }
} 