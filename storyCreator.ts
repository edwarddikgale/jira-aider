import OpenAI from 'openai';
import config from './config';
import { JiraIssue } from './models/jiraIssue';
import parseTextToJiraIssues from './jiraIssueParser';
import commitIssueToJira from './storyCommitter';
import { BasicStoryCreatePrompt } from './models/storyPromptDetails';
import { ColorEnum, consoleLogInColor } from './console/consoleColorPrinter';
import { askQuestion } from './console/askQuestion';
import createCompletion from './openai/createCompletion';
import { askBasicStoryCreationQuestions } from './prompts/askStoryCreationQuestions';

const openai = new OpenAI({
  apiKey: config.openAiKey
});

const MAX_RESPONSES = 5;

// Function to create a prompt from StoryDetails
const createPromptFromStoryDetails = (details: BasicStoryCreatePrompt): string =>{
    const { beneficiary, goal, importance } = details;
    return `Create a user story with a short title (written as short form of user story e.g user can logout), description & basic acceptance criteria based on the following inputs:\nBeneficiary: ${beneficiary}\nGoal: ${goal}\nImportance: ${importance}\n\nUser Stories:`;
}

const storyCreator = async () => {
    consoleLogInColor("\n ANSWER SIMPLE QUESTIONS BELOW TO CREATE A QUALITY USER STORY \n", ColorEnum.YELLOW);
    const storyPromptDetails = await askBasicStoryCreationQuestions();

    const prompt = createPromptFromStoryDetails(storyPromptDetails);
    await createStoryFromPrompt(prompt);
}

const printStoriesToConsole = (stories: string[]) => {

    stories.forEach((story, index) => { 
            consoleLogInColor(`\nOPTION: ${index + 1}\n`, ColorEnum.GREEN);
            console.log(story);
    });
}


const extractJiraIssues = (stories: string[]) =>{
    const jiraIssues: JiraIssue[] = [];

    stories.forEach(story => {
        const jiraIssue = parseTextToJiraIssues(story);
        jiraIssues.push(jiraIssue);
    });

    return jiraIssues;
}

const extractStories = (completion: OpenAI.Chat.Completions.ChatCompletion) =>{
    const stories: string[] = [];

    if (completion.choices && completion.choices.length > 0) {
        completion.choices.forEach((choice, index) => {
            const choices = choice.message.content?.split(/\n(?=Title: )/); 
            if(choices === undefined) throw Error("Unable to extract stories from openAi response");
            
            choices.map(story => {
                stories.push(story);
            });
        });

        return stories;
    } else {
        throw Error("No completion choices found.");
    }
}

const createStoryFromPrompt = async (prompt: string) => {
    let jiraIssues: JiraIssue[] = [];
    let stories: string[] = [];

    try {
      
      const numOfResponses = await askQuestion(`Number of response options (max ${MAX_RESPONSES}): `);
      const numOfResponsesAsInt = parseInt(<string>numOfResponses);
      const responsesMax = numOfResponsesAsInt > MAX_RESPONSES? MAX_RESPONSES: numOfResponsesAsInt;
      const completion = await createCompletion(prompt, responsesMax); 

      console.log("\n");
      stories = extractStories(completion);
      printStoriesToConsole(stories);
      jiraIssues = extractJiraIssues(stories);  

    } catch (error) {
      console.error('Error generating user stories:', error);
    }

    chooseStory(stories, jiraIssues);

}

  const chooseStory = async (stories: string[], jiraIssues: JiraIssue[]) => {
    let storyChoice:any = ''; 

    while(storyChoice != 'q'){
        storyChoice = await askQuestion("\nChoose a story to use by number (1/2/...) or type q to quit or rs to restart : ");
        if(storyChoice === 'q') {process.exit(); }
        if(storyChoice === 'rs') { storyCreator(); return; }

        consoleLogInColor(`\nYou chose story ${storyChoice}`, ColorEnum.MAGENTA);
        const choiceIndex = parseInt(storyChoice) - 1;
        console.log(jiraIssues[choiceIndex]);

        const push = await askQuestion("\n\nPush story to Jira? yes/no? ");
        if(push === "yes"){
            await commitIssueToJira(jiraIssues[choiceIndex]);
        }
        else{
            storyCreator();
            process.exit();
        }
    }
  }

  //call starting function
  storyCreator();