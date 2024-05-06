import { JiraIssue } from "../models/jiraIssue";
import { BasicStoryCreatePrompt, IssueRefactorPrompt } from "../models/storyPromptDetails";
import sample from './sample.json';
const STORY_BASICS = '';

const createPromptFromStoryDetails = (prompt: BasicStoryCreatePrompt): string =>{
    const { beneficiary, goal, importance } = prompt;
    return `Create a user story with a short title (written as short form of user story e.g user can logout), description & basic acceptance criteria, following this sample ${sample.formatExample} based on the following inputs:\nBeneficiary: ${beneficiary}\nGoal: ${goal}\nImportance: ${importance}\n\nUser Stories:`;
}

const createPromptFromRefactorDetails = (prompt: IssueRefactorPrompt, issue: JiraIssue): string =>{
    const { details } = prompt;
    return `Refactor jira issue here ${JSON.stringify(issue)} and output following this sample ${sample.formatExample} using the improvement prompt here: ${details}`;
}

export {createPromptFromStoryDetails, createPromptFromRefactorDetails}
