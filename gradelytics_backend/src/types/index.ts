export interface Calculation {
  id: string;
  user_id: string;
  type: 'gpa' | 'cgpa';
  semester?: string;
  result: number;
  details: any;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
} 