import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to wrap readline.question in a promise
const askQuestion = (query: string) => {
    // ANSI escape code for blue text
    const blue = '\x1b[34m';
    // ANSI reset code to reset text color
    const reset = '\x1b[0m';
    
    return new Promise(resolve => rl.question(blue + query + reset, (answer: unknown) => resolve(answer)));
}

export {askQuestion}