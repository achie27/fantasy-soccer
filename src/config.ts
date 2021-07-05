export const serverPort: number =
  Number(process.env.PORT) || Number(process.env.SERVER_PORT) || 3000;

export const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET;
export const accessTokenExpiry: number = 12 * 60 * 60 * 1000; // half day

export const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET;
export const refreshTokenExpiry: number = 7 * 24 * 60 * 60 * 1000; // 7 days

export const dbUri: string = process.env.MONGO_URI;
