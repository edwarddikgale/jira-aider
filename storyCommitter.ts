import config from './config';
import { Version3Client } from 'jira.js';
import { JiraIssue } from './models/jiraIssue';

const commitIssueToJira = (issue: JiraIssue) =>{
    const jiraBaseUrl = 'https://rsklabs.atlassian.net';
    
    const client = new Version3Client({
        host: jiraBaseUrl,
        authentication: {
          basic: {
            email: config.userEmail,
            apiToken: config.apiKey,
          },
        },
      });

    issue.project.key = 'TPPAG';
    //issue.description = createIssueDescription(issue.description, issue.acceptanceCriteria);  
    delete issue.acceptanceCriteria;
    let issueData = { fields: issue };
      
      // Create the new issue
      client.issues.createIssue(issueData)
        .then(issue => {
            console.log(`New issue created: ${issue.key}`);
        })
        .catch((err: any) => {
            console.error(`Failed to create new issue: ${JSON.stringify(err)}`);
        });
  }

  const createIssueDescription = (story: string, criteria?: string[]): string =>{
    if(criteria === undefined) return `Description:\n${story}`;
    
    let description = `Description:\n${story}\n\nAcceptance Criteria:\n`;
    const criteriaText = criteria.map(criterion => `- ${criterion}`).join('\n');
    description += criteriaText;
    return description;
  }

  export default commitIssueToJira;