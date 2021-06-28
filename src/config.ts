export const serverPort: number =
  Number(process.env.PORT) || Number(process.env.SERVER_PORT) || 3000;
export const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET;

export const dbUri: string = process.env.MONGO_URI;

export const accessTokenExpiry: number = 7 * 24 * 60 * 60 * 1000; // 7days
