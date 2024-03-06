import OpenAI from 'openai';
import { JiraIssue } from './models/jiraIssue';
import commitIssueToJira from './storyCommitter';
import { ColorEnum, consoleLogInColor } from './console/consoleColorPrinter';
import { askQuestion } from './console/askQuestion';
import createCompletion from './openai/createCompletion';
import { askBasicStoryCreationQuestions } from './prompts/askStoryCreationQuestions';
import extractJiraIssues from './jira/extractJiraIssues';
import {createPromptFromStoryDetails} from './prompts/createPrompt';

interface AIStoryGenerator{

}

class ConsoleStoryGenerator implements AIStoryGenerator{

    MAX_RESPONSES:number = 5;

    extractStories = (completion: OpenAI.Chat.Completions.ChatCompletion) =>{
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
            throw Error("No completion choices found. Unable to extract stories");
        }
    }

    printStoriesToConsole = (stories: string[]) => {

        stories.forEach((story, index) => { 
                consoleLogInColor(`\nOPTION: ${index + 1}\n`, ColorEnum.GREEN);
                console.log(story);
        });
    }

    getNumResponseOptions = async (): Promise<number> => {
        const numOfResponses = await askQuestion(`How many user story options do you want? (max ${this.MAX_RESPONSES}): `);
        const numOfResponsesAsInt = parseInt(<string>numOfResponses);
        return numOfResponsesAsInt > this.MAX_RESPONSES? this.MAX_RESPONSES: numOfResponsesAsInt;
    }
    
    createStoryFromPrompt = async (prompt: string) => {
        let jiraIssues: JiraIssue[] = [];
        let stories: string[] = [];
    
        try {
          const numOfOptions = await this.getNumResponseOptions();
          const completion = await createCompletion(prompt, numOfOptions); 
    
          console.log("\n");
          stories = this.extractStories(completion);
          this.printStoriesToConsole(stories);
          jiraIssues = extractJiraIssues(stories);  
    
        } catch (error) {
          console.error('Error extracting user stories:', error);
        }
    
        this.chooseJiraIssue(jiraIssues);
    
    }

    private chooseJiraIssue = async (jiraIssues: JiraIssue[]) => {
        let storyChoice:any = ''; 
    
        while(storyChoice != 'q'){
            storyChoice = await askQuestion("\nChoose a story to use by number (1/2/...) or type q to quit or rs to restart : ");
            if(storyChoice === 'q') { process.exit(); }
            if(storyChoice === 'rs') { this.start(); return; }
    
            consoleLogInColor(`\nYou chose story ${storyChoice}`, ColorEnum.MAGENTA);
            const choiceIndex = parseInt(storyChoice) - 1;
            console.log(jiraIssues[choiceIndex]);
    
            const push = await askQuestion("\n\nPush story to Jira? yes/no? ");
            if(push === "yes"){
                await commitIssueToJira(jiraIssues[choiceIndex]);
            }
            else{
                //storyCreator();
                process.exit();
            }
        }
    }

    start = async () => {
        consoleLogInColor("\n ANSWER SIMPLE QUESTIONS BELOW TO CREATE A QUALITY USER STORY \n", ColorEnum.YELLOW);
        const storyPromptDetails = await askBasicStoryCreationQuestions();
    
        const prompt = createPromptFromStoryDetails(storyPromptDetails);
        await this.createStoryFromPrompt(prompt);
    }

}

export {ConsoleStoryGenerator, AIStoryGenerator}