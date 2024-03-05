enum ColorEnum {
    RED = '\x1b[31m',
    GREEN = '\x1b[32m',
    YELLOW = '\x1b[33m',
    BLUE = '\x1b[34m',
    MAGENTA = '\x1b[35m',
    CYAN = '\x1b[36m',
    WHITE = '\x1b[37m',
    BLACK = '\x1b[30m'
  }
  
  const consoleLogInColor = (text: string, color: ColorEnum) => {
    const reset = '\x1b[0m'; // Resets the console color
    console.log(`${color}${text}${reset}`);
  };

  export {ColorEnum, consoleLogInColor};
  
  // Example usage
  //printToConsoleInColor('Hello, World!', ColorEnum.GREEN);