const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.evaluateCode = async (language, sourceCode, userPrompt = '') => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are a senior technical interviewer and coding mentor at a top global MNC with experience interviewing over 1000 candidates.
    Evaluate the following submission as if you were interviewing a real candidate.
    Language: ${language}
    Code:
    ${sourceCode}

    ${userPrompt ? `User Context/Question: ${userPrompt}` : ''}

    Provide your feedback strictly in Markdown format, structured as follows:
    ### 1. Code Review & Correctness
    (Analyze logic, detect syntax or runtime issues, mention edge cases that might fail)

    ### 2. Complexity Analysis
    (Explain Time Complexity and Space Complexity of the current approach)

    ### 3. Optimization & Best Practices
    (Suggest a better approach if one exists, point out bad coding practices, and provide hints instead of direct answers)

    ### 4. Interviewer's Feedback
    (Give interview-style feedback: e.g., "Good communication of logic, but missed edge cases like empty arrays.")

    Keep the tone encouraging, professional, and mentor-like.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate AI evaluation.');
  }
};

exports.interviewConversation = async (language, transcript, conversation = []) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const conversationContext = conversation
      .map((message) => `${message.role === 'user' ? 'Candidate:' : 'Interviewer:'} ${message.content}`)
      .join('\n');

    const prompt = `
    You are a senior interviewer at a top global MNC who has interviewed over 1000 candidates.
    Conduct a mock interview and give guidance like an experienced hiring manager.
    Language: ${language}

    ${conversationContext ? `Conversation so far:\n${conversationContext}` : ''}
    Candidate says: ${transcript}

    Respond with a thoughtful, professional interviewer answer. Provide feedback on the answer, follow up with the next interview-style question, and keep the tone realistic and constructive.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate mock interview response.');
  }
};
