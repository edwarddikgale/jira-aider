import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
    userEmail: string;
    apiKey: string;
    openAiKey: string;
    projectKey: string;
    jiraBaseUrl: string;
}

const config: Config = {
    userEmail: process.env.USER_EMAIL!,
    apiKey: process.env.JIRA_API_KEY!,
    openAiKey: process.env.OPENAI_API_KEY!,
    projectKey: process.env.JIRA_PROJECT_KEY!,
    jiraBaseUrl: process.env.JIRA_BASE_URL!
  };
  
export default config;