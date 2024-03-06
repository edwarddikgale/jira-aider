import config from './config';
import { Version3Client } from 'jira.js';
import { JiraIssue } from './models/jiraIssue';

const jiraBaseUrl = 'https://rsklabs.atlassian.net';

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

const updateJiraIssue = async(issueId: string, issue: JiraIssue) => {
    const client = constructJiraClient();
    issue.project.key = config.projectKey;
    // Assuming createIssueDescription is defined elsewhere and synchronous
    // issue.description = createIssueDescription(issue.description, issue.acceptanceCriteria);  
    delete issue.acceptanceCriteria;
    let issueData = { fields: issue };
      
    try {
      // Wait for the issue creation to complete
      const updatedIssue = await client.issues.editIssue({
        issueIdOrKey: issueId,
        fields: {
          summary: issue.summary,
          description: issue.description,
        },});
      console.log(`Issue ${issueId} updated successfully. Check Jira for changes.`);
    } catch (err) {
      // Assuming err is of type any; you might want to handle specific error types differently
      console.error(`Failed to update issue ${issueId} : ${JSON.stringify(err)}`);
    }
}

// Assuming Version3Client and JiraIssue are imported or defined elsewhere
async function createJiraIssue(issue: JiraIssue) {

    const client = constructJiraClient();
    issue.project.key = config.projectKey;
    // Assuming createIssueDescription is defined elsewhere and synchronous
    // issue.description = createIssueDescription(issue.description, issue.acceptanceCriteria);  
    delete issue.acceptanceCriteria;
    let issueData = { fields: issue };
      
    try {
      // Wait for the issue creation to complete
      const createdIssue = await client.issues.createIssue(issueData);
      console.log(`New issue created: ${createdIssue.key} in Jira. Check Jira backlog for verification.`);
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

  export {createJiraIssue, updateJiraIssue};