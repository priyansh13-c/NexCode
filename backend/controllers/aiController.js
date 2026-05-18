const aiService = require('../services/aiService');
const plagiarismService = require('../services/plagiarismService');
const Submission = require('../models/Submission');

exports.evaluate = async (req, res) => {
  try {
    const { language, sourceCode, userPrompt } = req.body;
    const userId = req.user.id;

    if (!language || !sourceCode) {
      return res.status(400).json({ message: 'Language and source code are required' });
    }

    // 1. Check Plagiarism
    const plagiarismScore = await plagiarismService.checkPlagiarism(Submission, sourceCode, language, userId);

    // 2. Generate AI Feedback
    const feedback = await aiService.evaluateCode(language, sourceCode, userPrompt);
    
    // 3. Save Submission
    const submission = new Submission({
      user: userId,
      language,
      code: sourceCode,
      aiFeedback: feedback,
      plagiarismScore
    });
    await submission.save();

    // 4. Return combined response
    const finalFeedback = `**Plagiarism Score: ${plagiarismScore}%**\n\n${feedback}`;
    
    res.json({ feedback: finalFeedback, plagiarismScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
