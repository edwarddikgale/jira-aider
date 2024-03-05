import { askQuestion } from "../console/askQuestion";
import { BasicStoryCreatePrompt } from "../models/storyPromptDetails";

const askBasicStoryCreationQuestions = async(): Promise<BasicStoryCreatePrompt> => {
    const goal = await askQuestion("What do you want to achieve? ");
    const beneficiary = await askQuestion("Who is the ultimate beneficiary of this work (which user or stakeholder)? ");
    const importance = await askQuestion("Why is this important to this user or stakeholder? ");
    
    return {
      beneficiary,
      goal,
      importance
    } as BasicStoryCreatePrompt;
}

export {askBasicStoryCreationQuestions};