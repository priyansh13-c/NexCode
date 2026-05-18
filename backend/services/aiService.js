const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.evaluateCode = async (language, sourceCode, userPrompt = '') => {
  try {
    // Initialize inside to ensure process.env is loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Act as an expert AI Coding Mentor and Interviewer. Evaluate the following code submission.
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
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate AI evaluation.');
  }
};
