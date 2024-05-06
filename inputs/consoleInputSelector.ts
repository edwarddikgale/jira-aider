import { InputValidator } from '../prompts/validators/storyChoiceInputValidator'; 
import { Choice } from './choice';

class ConsoleInputSelector<T extends Choice> {

    private choices: T[];
    private inputValidator: InputValidator;

    constructor(choices: T[], inputValidator: InputValidator) {
        this.choices = choices;
        this.inputValidator = inputValidator;
    }

    async selectOption(): Promise<T> {

        const choiceDescriptions = this.choices.map(c => `${c.key}: ${c.title} - ${c.description}`).join('\n');
        const validKeys = this.choices.map(c => c.key);

        const commitOptionPrompt = `\nPlease select an option:\n${choiceDescriptions}\nChoice: `;
        const input = await this.inputValidator.getValidInput(commitOptionPrompt, validKeys);

        const selectedChoice = this.choices.find(c => c.key.toLowerCase() === input.toLowerCase());

        if (!selectedChoice) {
            throw new Error("Invalid input received");
        }

        return selectedChoice;
    }
}

export {ConsoleInputSelector}
