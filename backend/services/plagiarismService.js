// Simple Token-based Similarity (Jaccard Index)
function getTokens(code) {
  return new Set(code.toLowerCase().match(/\w+/g) || []);
}

exports.calculateSimilarity = (code1, code2) => {
  const set1 = getTokens(code1);
  const set2 = getTokens(code2);

  if (set1.size === 0 && set2.size === 0) return 0;

  let intersection = 0;
  for (let token of set1) {
    if (set2.has(token)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return Math.round((intersection / union) * 100);
};

exports.checkPlagiarism = async (SubmissionModel, newCode, language, userId) => {
  // Find other submissions in the same language by DIFFERENT users
  const pastSubmissions = await SubmissionModel.find({ 
    language,
    user: { $ne: userId }
  }).limit(50); // check against last 50 for performance

  let maxSimilarity = 0;

  for (let sub of pastSubmissions) {
    const score = this.calculateSimilarity(newCode, sub.code);
    if (score > maxSimilarity) {
      maxSimilarity = score;
    }
  }

  return maxSimilarity;
};
