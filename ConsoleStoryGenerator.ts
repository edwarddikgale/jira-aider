import OpenAI from 'openai';
import { JiraIssue } from './models/jiraIssue';
import {createJiraIssue, updateJiraIssue} from './storyCommitter';
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
    private issueIdOrKey:string = '';

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
    
    createStoryFromPrompt = async (prompt: string, numOfOptions: number) => {
        let jiraIssues: JiraIssue[] = [];
        let stories: string[] = [];
    
        try {
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

    refactorStoryFromPrompt = async (issueIdOrKey: string, prompt: string) => {
        if(issueIdOrKey == '' || issueIdOrKey === null || issueIdOrKey === undefined){
            throw Error("Invalid issue id or key param. This param cannot be an empty string, null or undefined");
        }
        this.issueIdOrKey = issueIdOrKey;
        this.createStoryFromPrompt(prompt, 1);
    }

    private issueAlreadyExists = () => {
        return this.issueIdOrKey != "";
    }

    private chooseJiraIssue = async (jiraIssues: JiraIssue[]) => {
        let storyChoice:any = ''; 
    
        while(storyChoice != 'q'){
            storyChoice = await askQuestion("\nChoose a story to use by number (1/2/...) or type q to quit or rs to restart : ");
            if(storyChoice === 'q') { process.exit(); }
            if(storyChoice === 'rs') { this.start(); return; }
    
            consoleLogInColor(`\nYou chose story ${storyChoice}\n`, ColorEnum.MAGENTA);
            const choiceIndex = parseInt(storyChoice) - 1;
            console.log(jiraIssues[choiceIndex]);

            const changesText = this.issueAlreadyExists()? `changes for ${this.issueIdOrKey} `: "";  
            const push = await askQuestion(`\n\nPush story ${changesText} to Jira? yes/no?: `);

            if(push === "yes" && !this.issueAlreadyExists()){
                await createJiraIssue(jiraIssues[choiceIndex]);
            }
            if(push === "yes" && this.issueAlreadyExists()){
                await updateJiraIssue(this.issueIdOrKey, jiraIssues[choiceIndex]);
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
        const numOfOptions = await this.getNumResponseOptions();
        await this.createStoryFromPrompt(prompt, numOfOptions);
    }

}

export {ConsoleStoryGenerator, AIStoryGenerator}