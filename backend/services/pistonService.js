const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

exports.executeCode = async (language, sourceCode) => {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const filename = `temp_${Date.now()}`;
  let ext = '';
  let command = '';

  switch (language) {
    case 'javascript':
      ext = '.js';
      command = `node ${filename}${ext}`;
      break;
    case 'python':
      ext = '.py';
      command = `python ${filename}${ext}`;
      break;
    case 'java':
      ext = '.java';
      // For simple java files, starting from Java 11 we can run them directly
      command = `java ${filename}${ext}`;
      break;
    case 'cpp':
      ext = '.cpp';
      // requires g++ installed locally
      command = `g++ ${filename}${ext} -o ${filename} && .\\${filename}.exe`;
      break;
    default:
      throw new Error('Unsupported language');
  }

  const filepath = path.join(tempDir, filename + ext);
  fs.writeFileSync(filepath, sourceCode);

  try {
    const { stdout, stderr } = await execPromise(command, { cwd: tempDir, timeout: 5000 });
    return { stdout, stderr, code: 0 };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr || error.message, code: 1 };
  } finally {
    // Cleanup
    try {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      if (language === 'cpp') {
        const exePath = path.join(tempDir, `${filename}.exe`);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      }
    } catch (e) {}
  }
};
