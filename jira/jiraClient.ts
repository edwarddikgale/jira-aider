import config from '../config';
import { Version3Client } from "jira.js";

const constructJiraClient = () => {
    return new Version3Client({
            host: config.jiraBaseUrl,
            authentication: {
            basic: {
                email: config.userEmail,
                apiToken: config.apiKey,
            },
        },
    }); 
}

export default constructJiraClient;