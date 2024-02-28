import axios from 'axios';
import { Version3Client } from 'jira.js';
import parseDescription from './utils/jiraDescriptionParser';
import config from './config';

const jiraBaseUrl = 'https://rsklabs.atlassian.net';
const issueId = 'TPPAG-66'; // Replace with your issue ID

async function getJiraIssue() {


  try {
    const client = new Version3Client({
        host: jiraBaseUrl,
        authentication: {
          basic: {
            email: config.userEmail,
            apiToken: config.apiKey,
          },
        },
      }); 
      
    const issue = await client.issues.getIssue({ issueIdOrKey: issueId });
    console.log(`Title: ${issue.fields.summary}`);
    console.log(`Description: ${parseDescription(issue.fields.description?.content)}`);
    //console.log(`Description: ${issue.fields.description.content[0].content[0].text}`);
    //console.log(issue);
    //const newIssue = await client.issues.createIssue({ issueIdOrKey: issueId });

  } catch (error) {
    console.error('Error fetching Jira issue:', error);
  }
}



getJiraIssue();
