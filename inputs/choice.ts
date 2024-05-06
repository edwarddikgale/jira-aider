

enum ActionOption {
    Refactor = "REF",
    CommitToJira = "PUSH"
}

interface Choice {
    description: string,
    title: string,
    key: string
}

enum CommitRefactorOption {
    Refactor = "REF",
    CommitToJira = "PUSH",
    Quit = "QUIT",
    Restart = "RESTART"
}

interface CommitRefactorChoice extends Choice {
    option: CommitRefactorOption,
    description: string,
    title: string,
    key: string
}

export {Choice, CommitRefactorChoice, CommitRefactorOption}