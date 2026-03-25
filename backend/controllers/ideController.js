const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// JDoodle API - free tier: 200 executions/day
// Sign up free at: https://www.jdoodle.com/compiler-api/
// Add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET to your .env

const LANGUAGE_MAP = {
  python:     { language: 'python3',   versionIndex: '3' },
  cpp:        { language: 'cpp17',     versionIndex: '0' },
  c:          { language: 'c',         versionIndex: '5' },
  java:       { language: 'java',      versionIndex: '4' },
  javascript: { language: 'nodejs',    versionIndex: '4' },
  typescript: { language: 'typescript', versionIndex: '0' },
  go:         { language: 'go',        versionIndex: '4' },
  rust:       { language: 'rust',      versionIndex: '4' },
  ruby:       { language: 'ruby',      versionIndex: '4' },
  php:        { language: 'php',       versionIndex: '4' },
  swift:      { language: 'swift',     versionIndex: '4' },
  kotlin:     { language: 'kotlinc',   versionIndex: '3' },
  csharp:     { language: 'csharp',    versionIndex: '4' },
  bash:       { language: 'bash',      versionIndex: '4' },
  scala:      { language: 'scala',     versionIndex: '4' },
};

// @desc    Run code via JDoodle
// @route   POST /api/ide/run
const runCode = async (req, res) => {
  const { language, source_code, stdin } = req.body;

  if (!language || !source_code) {
    return res.status(400).json({
      success: false,
      message: 'language and source_code are required'
    });
  }

  const lang = language.toLowerCase();
  const langConfig = LANGUAGE_MAP[lang];

  if (!langConfig) {
    return res.status(400).json({
      success: false,
      message: `Unsupported language: ${language}`
    });
  }

  const clientId     = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      success: false,
      message: 'JDoodle API credentials not configured. Add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET to your .env file.'
    });
  }

  try {
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script:       source_code,
        stdin:        stdin || '',
        language:     langConfig.language,
        versionIndex: langConfig.versionIndex,
      }),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      return res.status(400).json({
        success: false,
        message: result.error || result.message || 'JDoodle execution failed'
      });
    }

    const isError = result.statusCode !== 200;

    res.json({
      success: true,
      data: {
        status:  isError ? 'Error' : 'Success',
        output:  result.output || '(no output)',
        isError,
        memory:  result.memory,
        cpuTime: result.cpuTime,
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runCode };
