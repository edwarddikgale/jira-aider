const parseDescription = (content: any): string => {
    let descriptionText = '';
  
    // Check if content is an array and iterate through it
    if (Array.isArray(content)) {
      content.forEach(item => {
        // Recursive call to handle nested structures
        descriptionText += parseDescription(item) + ' ';
      });
    } else if (content && typeof content === 'object') {
      // Handle different types of objects (e.g., paragraph, text, listItem)
      if (content.type === 'text') {
        // Append text content directly
        descriptionText += content.text + ' ';
      } else if (content.content) {
        // Recursive call for objects with 'content' key
        descriptionText += parseDescription(content.content);
      }
      // Handle line breaks or other formatting as needed
      if (content.type === 'paragraph') {
        descriptionText += ' \n'; // Add a newline after paragraphs for readability
      }
    }
    return descriptionText.trim();
}

export default parseDescription;