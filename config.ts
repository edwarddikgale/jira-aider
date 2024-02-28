import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
    userEmail: string;
    apiKey: string;
    openAiKey: string;
}

const config: Config = {
    userEmail: process.env.USER_EMAIL!,
    apiKey: process.env.API_KEY!,
    openAiKey: process.env.OPENAI_API_KEY!
  };
  
export default config;