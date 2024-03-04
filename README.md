# jira-aider
Help devs &amp; po's create user stories with ai and analyse their jira boards and tasks

Instructions for tech and non tech users

Step 1: create a new directory in your projects folder (or a folder of your choice) called "Jira", open visual studio  code and open this folder
Step 2: in the terminal, clone the code (paste the next command to terminal): git clone https://github.com/edwarddikgale/jira-aider.git
Step 3: browse to the project on the left hand side (of visual studio or your IDE of choice_
Step 4: Create a new file called ".env" in the root of your project (variables are listed after these steps..)
Step 5: Replace the variable values with those of your own
Step 6: look at the contents of file _prompts for prompt examples when using this code
Step 7: run project with this command in terminal window:  npx ts-node storyCreator.ts  , feel free to use example by copy pasting one answer at a time

.env variables

USER_EMAIL=xxxx@xyoco.com
OPENAI_API_KEY=sk-XXXXXXXtow6umT3BlbkFJWBxzpO9r7RGGkKoFXXX
JIRA_PROJECT_KEY=TPPAG
JIRA_API_KEY=XXXX

To get your Jira Api key, go to: https://id.atlassian.com/manage-profile/security/api-tokens 
and create tour own api key then paste it in the .env variables

For requests or issues please create Git Issues and I will prioritise, and deliver as usual in increments.





