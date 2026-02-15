export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  profile?: string | null;
  role_id?: string | null;
  role?: {
    id: string;
    name: string;
  };
  credit_limit?: number;
}



