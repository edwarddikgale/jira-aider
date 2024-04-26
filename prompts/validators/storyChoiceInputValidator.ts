import { askQuestion } from "../../console/askQuestion";

class StoryChoiceInputValidator {
    private readonly MAX_RESPONSES: number;

    constructor(maxResponses: number) {
        this.MAX_RESPONSES = maxResponses;
    }

    async getValidNumberInput(promptMessage: string): Promise<number> {
        let input: string;
        let number: number;

        do {
            input = await askQuestion(promptMessage) as string;
            number = parseInt(input);

            if (isNaN(number) || number <= 0 || number > this.MAX_RESPONSES) {
                console.log(`Invalid input. Please enter a number between 1 and ${this.MAX_RESPONSES}.`);
            }
        } while (isNaN(number) || number <= 0 || number > this.MAX_RESPONSES);

        return number;
    }
}

export default StoryChoiceInputValidator;
