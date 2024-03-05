import OpenAI from 'openai';
import config from '../config';

const openai = new OpenAI({
    apiKey: config.openAiKey
});

const createCompletion = async (prompt: string, numResponses: number) => {

    // Use the chat completions API
    return await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
        n: numResponses, // Since you're generating a single response, `n` is set to 1
    });
}

export default createCompletion;