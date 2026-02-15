import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const PORT = process.env.PORT || '3000';
export const HOST = process.env.HOST || 'localhost';
export const DATABASE_URL = process.env.DATABASE_URL;

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;