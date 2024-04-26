import axios from 'axios';
import { Version3Client } from 'jira.js';
import parseDescription from './utils/jiraDescriptionParser';
import config from './config';
import { askQuestion } from './console/askQuestion';
import { ColorEnum, consoleLogInColor } from './console/consoleColorPrinter';
import { ConsoleStoryGenerator } from './ConsoleStoryGenerator';
import { JiraIssue } from './models/jiraIssue';

const jiraBaseUrl = config.jiraBaseUrl;
let jiraIssueId: string = '';

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
    const isRewrite = <string>(await askQuestion(`Do you want to re-write/upgrade this issue? yes/no: `));
    if(isRewrite === "yes"){
        reWriteIssue(issue);
    }
    if(isRewrite === "no"){
        process.exit();
    }
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
        jiraIssueId = issueId;
        await printIssueToConsole(issue);

    } catch (error) {
        console.error('Error fetching Jira issue:', error);
        process.exit();
    }
}

const getIssueBasicSummary = (issue: any) => {
    return `title: ${issue.fields.summary}, description: ${parseDescription(issue.fields.description?.content)}`;
}

const reWriteIssue = async(issue: JiraIssue) => {
    const reWriteEg = "e.g: Use best practices/Make it more precise/etc";
    const reWriteInput = <string>(await askQuestion(`How should I re-write or improve this user story, id: ${jiraIssueId} ? ${reWriteEg} : `));
    const reWritePrompt = `Re write this story, ${getIssueBasicSummary(issue)}, this way ${reWriteInput}`;
    let consoleStoryGenerator = new ConsoleStoryGenerator();
    consoleStoryGenerator.refactorStoryFromPrompt(jiraIssueId, reWritePrompt);
}

const createRewritePrompt = (issue: JiraIssue) => {

}



getJiraIssue();
