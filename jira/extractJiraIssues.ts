import { JiraIssue } from "../models/jiraIssue";
import parseTextToJiraIssues from './jiraIssueParser';

const extractJiraIssues = (stories: string[]) =>{
    const jiraIssues: JiraIssue[] = [];

    stories.forEach(story => {
        const jiraIssue = parseTextToJiraIssues(story);
        jiraIssues.push(jiraIssue);
    });

    return jiraIssues;
}

export default extractJiraIssues;