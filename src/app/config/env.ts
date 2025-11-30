import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES: string;
  PASSWORD_SALT_ROUND: number;
  FRONTEND_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_EXPIRES",
    "PASSWORD_SALT_ROUND",
    "FRONTEND_URL",
  ];
  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing env variables ${key}`);
    }
  });
  return {
    PORT: process.env.PORT!,
    DB_URL: process.env.DB_URL!,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES!,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES!,
    PASSWORD_SALT_ROUND: Number(process.env.PASSWORD_SALT_ROUND)!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
  };
};

export const envVars = loadEnvVariables();
