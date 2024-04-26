import { askQuestion } from "../../console/askQuestion";

class StoryChoiceInputValidator {
    private readonly MAX_RESPONSES: number;

    constructor(maxResponses: number) {
        this.MAX_RESPONSES = maxResponses;
    }

    async getMaxStoryOptionsInput(promptMessage: string): Promise<number> {
        let input: string;
        let number: number;

        do {
            input = await askQuestion(promptMessage) as string;
            number = parseInt(input);

            if (isNaN(number) || number <= 0 || number > this.MAX_RESPONSES) {
                console.log(`\n Invalid input. Please enter a number between 1 and ${this.MAX_RESPONSES}.`);
            }
        } while (isNaN(number) || number <= 0 || number > this.MAX_RESPONSES);

        return number;
    }

    async getSelectedStoryOption(promptMessage: string, numOfOptions: number, promptOptions: string[]): Promise<string> {
        let input: string;
        let index: number;

        do {
            input = await askQuestion(promptMessage) as string;
            if(this.isInputOptionValid(input, promptOptions)) return input;
            
            index = parseInt(input);

            if (isNaN(index) || index < 1 || index > numOfOptions) {
                console.log(`\n Invalid input. Please enter a number between 1 and ${numOfOptions}.`);
            }
        } while (isNaN(index) || index < 1 || index > numOfOptions);

        return index.toString();
    }

    isInputOptionValid = (input: string, inputOptions: string[]): boolean => {
        return inputOptions.includes(input);
    }
}

export default StoryChoiceInputValidator;
