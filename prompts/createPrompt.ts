import { BasicStoryCreatePrompt } from "../models/storyPromptDetails";

const createPromptFromStoryDetails = (details: BasicStoryCreatePrompt): string =>{
    const { beneficiary, goal, importance } = details;
    return `Create a user story with a short title (written as short form of user story e.g user can logout), description & basic acceptance criteria based on the following inputs:\nBeneficiary: ${beneficiary}\nGoal: ${goal}\nImportance: ${importance}\n\nUser Stories:`;
}

export {createPromptFromStoryDetails}
