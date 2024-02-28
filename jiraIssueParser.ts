import { JiraIssue } from "./models/jiraIssue";

const parseTextToJiraIssue = (story: string | null): JiraIssue => {
      if(story === null) throw Error("Unable to parse null story");
      
      const titleMatch = story.match(/Title: (.+)/);
      const descriptionMatch = story.match(/Description:\s*([\s\S]+)$/);
      const acceptanceCriteriaMatch = story.match(/Acceptance Criteria:\n([\s\S]+)/);
  
      const title = titleMatch ? titleMatch[1] : '';
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      const acceptanceCriteria = acceptanceCriteriaMatch ? acceptanceCriteriaMatch[1].split('\n- ').slice(1) : [];
  
      return new JiraIssue(
        'YOUR_PROJECT_KEY', // Replace with your actual project key
        title,
        description,
        'Story', // Assuming the issue type is "Story"
        acceptanceCriteria
      );
    
}

export default parseTextToJiraIssue;