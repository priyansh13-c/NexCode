const pistonService = require('../services/pistonService');

exports.execute = async (req, res) => {
  try {
    const { language, sourceCode } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({ message: 'Language and source code are required' });
    }

    const runResult = await pistonService.executeCode(language, sourceCode);
    
    res.json({
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      code: runResult.code,
      signal: runResult.signal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
