import axios from 'axios';
import { Version3Client } from 'jira.js';
import parseDescription from './utils/jiraDescriptionParser';
import config from './config';
import { askQuestion } from './console/askQuestion';
import { JiraIssue } from './models/jiraIssue';
import {ColorEnum, consoleLogInColor} from './console/consoleColorPrinter';

const jiraBaseUrl = config.jiraBaseUrl;

const constructJiraClient = () => {
    return new Version3Client({
        host: jiraBaseUrl,
        authentication: {
        basic: {
            email: config.userEmail,
            apiToken: config.apiKey,
        },
    },
}); 
}

const printIssueToConsole = async (issue: any) => {

    consoleLogInColor("\nTitle:", ColorEnum.MAGENTA);
    console.log(` ${issue.fields.summary}`);
    consoleLogInColor("\nDescription:", ColorEnum.MAGENTA);
    console.log(` ${parseDescription(issue.fields.description?.content)}`);

    console.log("\n");
    const isRewrite = <string>(await askQuestion(`Do you want to re-write/upgrade this issue? yes/no`));
    //console.log(`Description: ${issue.fields.description.content[0].content[0].text}`);
    //console.log(issue);
    //const newIssue = await client.issues.createIssue({ issueIdOrKey: issueId });
}

const getJiraIssue = async () => {

    const exampleInput =  'TPPAG-66';
    const issueId = <string>(await askQuestion(`Please enter your Jira issue ID or Key, e.g ${exampleInput}: `));

    try {
        const client = constructJiraClient();        
        const issue = await client.issues.getIssue({ issueIdOrKey: issueId });
        await printIssueToConsole(issue);

    } catch (error) {
        console.error('Error fetching Jira issue:', error);
        process.exit();
    }
}



getJiraIssue();
