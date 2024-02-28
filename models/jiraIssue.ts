export class JiraIssue {
    project: { key: string };
    summary: string;
    description: string;
    issuetype: { name: string };
    acceptanceCriteria?: string[] = [];

    constructor(projectKey: string, summary: string, description: string, issueTypeName: string, acceptanceCriteria: string[]) {
        this.project = { key: projectKey };
        this.summary = summary;
        this.description = description;
        this.issuetype = { name: issueTypeName };
        this,acceptanceCriteria = acceptanceCriteria;
    }

    // Method to return the issue data as an object, suitable for API requests
    getIssueData(): object {
        return {
            fields: {
                project: this.project,
                summary: this.summary,
                description: this.description,
                issuetype: this.issuetype,
                acceptanceCriteria: this.acceptanceCriteria
            }
        };
    }
}
