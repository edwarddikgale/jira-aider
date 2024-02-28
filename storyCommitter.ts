import config from './config';
import { Version3Client } from 'jira.js';
import { JiraIssue } from './models/jiraIssue';

// Assuming Version3Client and JiraIssue are imported or defined elsewhere
async function commitIssueToJira(issue: JiraIssue) {
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
    // Assuming createIssueDescription is defined elsewhere and synchronous
    // issue.description = createIssueDescription(issue.description, issue.acceptanceCriteria);  
    delete issue.acceptanceCriteria;
    let issueData = { fields: issue };
      
    try {
      // Wait for the issue creation to complete
      const createdIssue = await client.issues.createIssue(issueData);
      console.log(`New issue created: ${createdIssue.key}`);
    } catch (err) {
      // Assuming err is of type any; you might want to handle specific error types differently
      console.error(`Failed to create new issue: ${JSON.stringify(err)}`);
    }
  }
  

  const createIssueDescription = (story: string, criteria?: string[]): string =>{
    if(criteria === undefined) return `Description:\n${story}`;
    
    let description = `Description:\n${story}\n\nAcceptance Criteria:\n`;
    const criteriaText = criteria.map(criterion => `- ${criterion}`).join('\n');
    description += criteriaText;
    return description;
  }

  export default commitIssueToJira;