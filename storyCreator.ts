import * as readline from 'readline';
import OpenAI from 'openai';
import config from './config';
import { JiraIssue } from './models/jiraIssue';
import parseTextToJiraIssues from './jiraIssueParser';
import commitIssueToJira from './storyCommitter';
import { StoryPromptDetails } from './models/storyPromptDetails';
import { ColorEnum, consoleLogInColor } from './consoleColorPrinter';

const openai = new OpenAI({
  apiKey: config.openAiKey
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to wrap readline.question in a promise
function askQuestion(query: string) {
    // ANSI escape code for blue text
    const blue = '\x1b[34m';
    // ANSI reset code to reset text color
    const reset = '\x1b[0m';
    
    return new Promise(resolve => rl.question(blue + query + reset, (answer) => resolve(answer)));
}

async function AskStoryQuestions(): Promise<StoryPromptDetails> {
    const beneficiary = await askQuestion("Who is the ultimate beneficiary of this work (which user or stakeholder)? ");
    const goal = await askQuestion("What do you want to achieve? ");
    const importance = await askQuestion("Why is this important to this user or stakeholder? ");
    
    return {
      beneficiary,
      goal,
      importance
    } as StoryPromptDetails;
  }

// Function to create a prompt from StoryDetails
function createPromptFromStoryDetails(details: StoryPromptDetails): string {
    const { beneficiary, goal, importance } = details;
    return `Create a user story with a short title (written as short form of user story e.g user can logout), description & basic acceptance criteria based on the following inputs:\nBeneficiary: ${beneficiary}\nGoal: ${goal}\nImportance: ${importance}\n\nUser Stories:`;
}

async function storyCreator() {
    consoleLogInColor("\n ANSWER SIMPLE QUESTIONS BELOW TO CREATE A QUALITY USER STORY \n", ColorEnum.YELLOW);
    const storyPromptDetails = await AskStoryQuestions();

    // Construct the prompt
    //const prompt = `Create a user story with a short title (written as short form of user story e.g user can logout) , description & basic acceptance criteria based on the following inputs:\nBeneficiary: ${beneficiary}\nGoal: ${goal}\nImportance: ${importance}\n\nUser Stories:`;
    const prompt = createPromptFromStoryDetails(storyPromptDetails);
    const jiraIssues: JiraIssue[] = [];
    const stories: string[] = [];

    try {
      // Use the chat completions API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
        n: 2, // Since you're generating a single response, `n` is set to 1
      });
  
      console.log("\n");

      // Accessing and printing the response
      if (completion.choices && completion.choices.length > 0) {
        completion.choices.forEach((choice, index) => {
            const stories = choice.message.content?.split(/\n(?=Title: )/); 
            if(stories === undefined) throw Error("Unable to extract stories from openAi response");
            
            stories.map(story => {
                const jiraIssue = parseTextToJiraIssues(story);
                jiraIssues.push(jiraIssue);
                stories.push(story);

                consoleLogInColor(`\nOPTION: ${index + 1}\n`, ColorEnum.GREEN);
                console.log(story);
            });
        });
      } else {
        console.log("No completion choices found.");
      }
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