import OpenAI from 'openai';
import { JiraIssue } from './models/jiraIssue';
import {createJiraIssue, updateJiraIssue} from './storyCommitter';
import { ColorEnum, consoleLogInColor } from './console/consoleColorPrinter';
import { askQuestion } from './console/askQuestion';
import createCompletion from './openai/createCompletion';
import { askBasicStoryCreationQuestions, askIssueRefactorQuestions } from './prompts/askStoryCreationQuestions';
import extractJiraIssues from './jira/extractJiraIssues';
import {createPromptFromRefactorDetails, createPromptFromStoryDetails} from './prompts/createPrompt';
import StoryChoiceInputValidator, { InputValidator } from './prompts/validators/storyChoiceInputValidator';
import { ConsoleInputSelector } from './inputs/consoleInputSelector';
import { resolve } from 'path';
import { CommitRefactorChoice, CommitRefactorOption } from './inputs/choice';

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
        const inputValidator = new StoryChoiceInputValidator(this.MAX_RESPONSES); //todo: inject this
        const storyOptionsPrompt = `How many user story options do you want? (max ${this.MAX_RESPONSES}): `;
        const numOfResponses = await inputValidator.getMaxStoryOptionsInput(storyOptionsPrompt);
        return numOfResponses > this.MAX_RESPONSES? this.MAX_RESPONSES: numOfResponses;
    }
    
    createStoryFromPrompt = async (prompt: string, numOfOptions: number): Promise<JiraIssue[]> => {
        let jiraIssues: JiraIssue[] = [];
        let stories: string[] = [];
    
        try {
            const completion = await createCompletion(prompt, numOfOptions); 

            console.log("\n");
            stories = this.extractStories(completion);
            this.printStoriesToConsole(stories);
            jiraIssues = extractJiraIssues(stories);  

            return new Promise((resolve, reject) =>{ resolve(jiraIssues);});
    
        } catch (error) {
            const errorMsg = `Error extracting user stories: ${error}`;
            console.error(errorMsg);
            return new Promise((resolve, reject) =>{ reject(new Error(errorMsg));});
        }
    
    }

    refactorStoryFromPrompt = async (issueIdOrKey: string, prompt: string) => {
        if(issueIdOrKey == '' || issueIdOrKey === null || issueIdOrKey === undefined){
            throw Error("Invalid issue id or key param. This param cannot be an empty string, null or undefined");
        }
        this.issueIdOrKey = issueIdOrKey;
        
        do{
        
            const numOfOptions = 1;
            const jiraIssues = await this.createStoryFromPrompt(prompt, numOfOptions);
            const nextStepOption = await this.refactorOrCommitIssue();
            const issueChoice = await this.selectJiraIssue(jiraIssues);
    
            //todo: handle when issue choice is not a real issue but is quit or restart
            if(nextStepOption === CommitRefactorOption.CommitToJira){
                await this.commitIssueToJira(issueChoice);
                process.exit();
            }  
            if(nextStepOption === CommitRefactorOption.Refactor){
                prompt = await this.createPromptForIssueRefactor(issueChoice);
            }

        }while(true);
    }

    private issueAlreadyExists = () => {
        return this.issueIdOrKey != "";
    }

    private selectJiraIssue = async (jiraIssues: JiraIssue[]) :Promise<JiraIssue> => {
      
        const inputValidator = new StoryChoiceInputValidator(this.MAX_RESPONSES); //todo: inject this
        if(jiraIssues.length === 1){ 
            return new Promise((resolve, reject) => resolve(jiraIssues[0])); 
        }

        const storyChoicePrompt = "\nChoose a story to use by number (1/2/...) or type q to quit or rs to restart : ";
        const promptOptions = ['q','rs'];
        const selectedIssueNum = await inputValidator.getSelectedStoryOption(storyChoicePrompt, jiraIssues.length, promptOptions);
        try{
            const issueIndex = parseInt(selectedIssueNum) - 1;
            return new Promise((resolve, reject) => { resolve(jiraIssues[issueIndex]);})
            
        }
        catch(e: any){
            return new Promise((resolve, reject) => { reject(e);})
        }
    }

    private commitIssueToJira = async (jiraIssue: JiraIssue) => {
        consoleLogInColor(JSON.stringify(jiraIssue), ColorEnum.MAGENTA);

        const changesText = this.issueAlreadyExists()? `changes for ${this.issueIdOrKey} `: "";  
        const commitOptionPrompt = `\n\nPush story ${changesText} to Jira? yes/no?: `;
        const inputValidator = new StoryChoiceInputValidator(this.MAX_RESPONSES); //todo: inject this
        const commitOption =  await inputValidator.getCommitOption(commitOptionPrompt, ['yes', 'no']); 

        if(commitOption === "yes" && !this.issueAlreadyExists()){
            await createJiraIssue(jiraIssue);
        }
        if(commitOption === "yes" && this.issueAlreadyExists()){
            await updateJiraIssue(this.issueIdOrKey, jiraIssue);
        }
        else{
            //storyCreator();
            process.exit();
        }
    }

    private commitJiraIssue = async (jiraIssue: JiraIssue) => {
        console.log(jiraIssue);
        return createJiraIssue(jiraIssue);
    }

    refactorOrCommitIssue = async (): Promise<CommitRefactorOption> => {

        const myChoices: CommitRefactorChoice[] = [
            { option: CommitRefactorOption.Refactor, description: "Refactor issue.", title: "Modify the issue", key: "M"},
            { option: CommitRefactorOption.CommitToJira, description: "Commit issue.", title: "Push the issue to jira", key: "P"}
        ];

        const inputValidator = new InputValidator(); //todo: inject this
        const myChoiceSelector = new ConsoleInputSelector<CommitRefactorChoice>(myChoices, inputValidator);

        return new Promise((resolve, reject) => {
            myChoiceSelector.selectOption()
            .then(option => {
                console.log(`You selected: ${JSON.stringify(option)}`);
                resolve(option.option as CommitRefactorOption)
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
        });

    }

    createPromptForIssueRefactor = async (issue: JiraIssue): Promise<string> => {
        const refactorDetails = await askIssueRefactorQuestions();
        const prompt = createPromptFromRefactorDetails(refactorDetails, issue);
        return new Promise((resolve, reject) =>{
            resolve(prompt);
        })
    }

    start = async () => {

        consoleLogInColor("ANSWER SIMPLE QUESTIONS BELOW TO CREATE A QUALITY USER STORY \n", ColorEnum.YELLOW);
        const storyPromptDetails = await askBasicStoryCreationQuestions();
    
        let prompt = createPromptFromStoryDetails(storyPromptDetails);
        let skipNumOptions = false;

        do{
        
            const numOfOptions = skipNumOptions? 1: await this.getNumResponseOptions(); //ignore this if we are refactoring an issue
            const jiraIssues = await this.createStoryFromPrompt(prompt, numOfOptions);
            const nextStepOption = await this.refactorOrCommitIssue();
            const issueChoice = await this.selectJiraIssue(jiraIssues);
    
            //todo: handle when issue choice is not a real issue but is quit or restart
            if(nextStepOption === CommitRefactorOption.CommitToJira){
                await this.commitJiraIssue(issueChoice);
                process.exit();
            }  
            if(nextStepOption === CommitRefactorOption.Refactor){
                prompt = await this.createPromptForIssueRefactor(issueChoice);
                skipNumOptions = true
            }

        }while(true);

    }

}

export {ConsoleStoryGenerator, AIStoryGenerator}