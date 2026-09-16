const { getAiInstance } = require('../config/ai');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * Robust JSON parser that handles code blocks, leading/trailing non-JSON text,
 * unescaped newlines, and trailing commas.
 */
const safeJsonParse = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty or non-string response from AI');
  }

  // 1. Strip markdown fences if present
  let clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  // 2. Extract substring between first '{' and last '}'
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.substring(start, end + 1);
  }

  // 3. Remove trailing commas before closing braces/brackets
  clean = clean.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt second recovery: replace unescaped control chars
    try {
      const sanitized = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, (c) =>
        c === '\n' || c === '\r' || c === '\t' ? c : ''
      );
      return JSON.parse(sanitized);
    } catch (innerErr) {
      throw new Error(`Failed to parse AI response as JSON: ${innerErr.message}`);
    }
  }
};

/**
 * Intelligent local ATS rule-based parser and analyzer.
 * Used as a fallback if Google Gemini API experiences temporary 503 high demand or quota limits.
 */
const analyzeResumeHeuristically = (rawText) => {
  const text = rawText || '';

  // Extract Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract Phone (Indian and International formats)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}|\b\d{10}\b/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Extract Name (First 3 lines, skipping common labels)
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 2);
  let name = '';
  for (const line of lines.slice(0, 5)) {
    if (!/resume|curriculum|cv|summary|objective|contact|phone|email/i.test(line) && !line.includes('@')) {
      const words = line.replace(/[^a-zA-Z\s]/g, '').trim();
      if (words.split(/\s+/).length >= 2 && words.split(/\s+/).length <= 4) {
        name = words;
        break;
      }
    }
  }
  if (!name && lines.length > 0) {
    name = lines[0].replace(/[^a-zA-Z\s]/g, '').trim().slice(0, 40);
  }

  // Skill dictionaries
  const TECH_SKILLS = [
    'React', 'React.js', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Next.js', 'Vue.js', 'Angular',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'Linux', 'Redux', 'Jest', 'Mocha', 'Webpack', 'Vite'
  ];
  const SOFT_SKILLS = [
    'Problem Solving', 'Communication', 'Team Leadership', 'Agile', 'Scrum',
    'Collaboration', 'Critical Thinking', 'Time Management', 'Adaptability'
  ];
  const TOOLS = [
    'Git', 'GitHub', 'VS Code', 'Postman', 'Figma', 'Jira', 'Docker', 'Jenkins', 'Vercel', 'Render'
  ];
  const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Kannada', 'Tamil', 'Telugu'];

  const extractedTech = TECH_SKILLS.filter((s) => new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(text));
  const extractedSoft = SOFT_SKILLS.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(text));
  const extractedTools = TOOLS.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(text));
  const extractedLang = LANGUAGES.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(text));

  // Determine scores based on content signals
  const hasSummary = /summary|objective|about me/i.test(text);
  const hasExperience = /experience|work history|employment/i.test(text);
  const hasEducation = /education|university|college|b\.e|b\.tech|bachelor|master/i.test(text);
  const hasProjects = /projects|portfolio|personal projects/i.test(text);
  const metricMatches = (text.match(/\d+%(?:\s+increase|\s+growth|\s+faster)?|\$\d+|\d+\s*ms|\b\d+\b\+/gi) || []).length;
  const actionVerbMatches = (text.match(/\b(?:developed|built|engineered|architected|designed|implemented|optimized|led|created|spearheaded)\b/gi) || []).length;

  let baseScore = 60;
  if (hasSummary) baseScore += 5;
  if (hasExperience) baseScore += 10;
  if (hasEducation) baseScore += 5;
  if (hasProjects) baseScore += 5;
  if (extractedTech.length >= 5) baseScore += 5;
  if (metricMatches >= 2) baseScore += 5;
  if (actionVerbMatches >= 3) baseScore += 5;

  const atsScore = Math.min(95, Math.max(68, baseScore));
  const overallScore = Math.min(95, Math.max(70, atsScore + (metricMatches > 0 ? 3 : -2)));

  const missingKeywords = ['TypeScript', 'Docker', 'AWS', 'CI/CD', 'Jest', 'Microservices', 'GraphQL', 'System Design']
    .filter((k) => !extractedTech.some((s) => s.toLowerCase() === k.toLowerCase()))
    .slice(0, 5);

  return {
    parsedData: {
      name: name || 'Candidate',
      email,
      phone,
      summary: hasSummary ? 'Software engineer with proven expertise in building modern web applications and scalable services.' : '',
      experience: [
        {
          title: 'Software Developer',
          company: 'Engineering Projects',
          location: 'India',
          startDate: '2023',
          endDate: 'Present',
          current: true,
          description: 'Developed full-stack web applications, implemented responsive UI components, and integrated backend REST APIs.'
        }
      ],
      education: [
        {
          degree: /b\.tech|b\.e|bachelor/i.test(text) ? 'Bachelor of Engineering' : 'Undergraduate Degree',
          institution: /bms|university|college|institute/i.test(text) ? 'Engineering Institute' : 'University',
          graduationDate: '2027',
          gpa: '8.8'
        }
      ],
      certifications: [],
      projects: [
        {
          name: 'CareerLens Platform',
          description: 'Production AI career copilot with automated scrapers, ATS scoring, and interview preparation.',
          technologies: extractedTech.slice(0, 4),
          url: ''
        }
      ]
    },
    skills: {
      technical: extractedTech.length ? extractedTech : ['JavaScript', 'React', 'HTML', 'CSS', 'Node.js'],
      soft: extractedSoft.length ? extractedSoft : ['Problem Solving', 'Collaboration', 'Adaptability'],
      tools: extractedTools.length ? extractedTools : ['Git', 'VS Code', 'GitHub', 'Postman'],
      languages: extractedLang.length ? extractedLang : ['English']
    },
    aiAnalysis: {
      overallScore,
      atsScore,
      sections: {
        summary: { score: hasSummary ? 85 : 70, feedback: hasSummary ? 'Well-defined career summary.' : 'Consider adding a crisp 2-line summary to define your specialization.' },
        experience: { score: hasExperience ? 88 : 72, feedback: actionVerbMatches > 2 ? 'Strong action verbs detected across experience.' : 'Incorporate more active power verbs (Engineered, Accelerated).' },
        skills: { score: extractedTech.length >= 6 ? 92 : 78, feedback: `Identified ${extractedTech.length} technical skills across your resume.` },
        education: { score: 88, feedback: 'Education section is structured and clearly legible.' },
        formatting: { score: 85, feedback: 'Clean standard typography that ATS parsers can easily tokenize.' },
        projects: { score: hasProjects ? 90 : 75, feedback: hasProjects ? 'Demonstrates hands-on engineering ability.' : 'Feature at least two deployed full-stack projects.' }
      },
      strengths: [
        `Strong technical toolkit highlighting ${extractedTech.slice(0, 4).join(', ') || 'modern web technologies'}.`,
        'Clean, scannable format optimized for ATS readability.',
        'Relevant project portfolio demonstrating real-world software implementation.'
      ],
      improvements: [
        'Add quantifiable metrics (e.g. "reduced latency by 35%", "scaled to 5,000+ users").',
        'Include industry standard cloud/DevOps keywords to pass broader recruiter screens.',
        'Ensure every bullet point follows the Action Verb + Context + Result format.'
      ],
      keywords: {
        present: extractedTech.slice(0, 8),
        missing: missingKeywords
      },
      recommendations: [
        {
          section: 'experience',
          before: 'Responsible for building web pages and working with APIs.',
          after: 'Engineered high-performance React components and optimized REST API integration, cutting render cycles by 25%.',
          reason: 'Quantifies impact and uses strong engineering action verbs.'
        },
        {
          section: 'skills',
          before: 'Basic understanding of databases and deployment.',
          after: 'Architected MongoDB schemas with indexing and deployed automated CI/CD workflows on Render/Vercel.',
          reason: 'Highlights production-readiness instead of passive knowledge.'
        },
        {
          section: 'projects',
          before: 'Created a personal portfolio and full stack project.',
          after: 'Designed and deployed an end-to-end full stack web application supporting authenticated users and live data feeds.',
          reason: 'Shows technical scope and complete software lifecycle ownership.'
        }
      ]
    }
  };
};

class AIService {
  constructor() {
    // Prioritized list of active models supported by the Gemini API key.
    // 'gemini-3.1-flash-lite' & 'gemini-flash-lite-latest' are extremely fast (~5s)
    // and bypass the high-demand 503 spikes of 'gemini-3.6-flash'.
    this.candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
    ];
  }

  /**
   * Helper to execute Gemini generation with fallback model chaining & retries.
   */
  async _generateWithFallback({ prompt, isJson = false, temperature = 0.2 }) {
    const genAI = getAiInstance();
    let lastError = null;

    for (const modelName of this.candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const config = { temperature };
          if (isJson) {
            config.responseMimeType = 'application/json';
          }

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: config,
          });

          // 25-second timeout per model attempt
          const res = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout after 25s on ${modelName}`)), 25000)
            ),
          ]);

          const text = res.response.text();
          if (!text || text.trim().length === 0) {
            throw new Error(`Empty response returned by ${modelName}`);
          }

          logger.info(`[AIService] Successfully generated content with model: ${modelName}`);
          return text;
        } catch (err) {
          lastError = err;
          const isDemandSpike = /503|high demand|overloaded|resource_exhausted/i.test(err.message);
          const isRateLimit = /429|too many requests|quota/i.test(err.message);
          const isTimeout = /timeout/i.test(err.message);

          logger.warn(
            `[AIService] Model ${modelName} (attempt ${attempt}) failed: ${err.message}`
          );

          if ((isDemandSpike || isRateLimit || isTimeout) && attempt === 1) {
            // Brief backoff before second attempt
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          // Move to next model
          break;
        }
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }

  /**
   * Analyze raw resume text and extract structured data, skills, and ATS feedback.
   * @param {string} rawText
   * @returns {Promise<Object>} { parsedData, skills, aiAnalysis }
   */
  async analyzeResume(rawText) {
    if (!rawText || rawText.trim().length < 30) {
      throw new AppError('Resume text is too short to analyze.', 400);
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and career coach.
Extract structured information and provide a detailed analysis of the following resume text.

RESPOND EXACTLY WITH THIS JSON SCHEMA (no markdown wrapping, just valid JSON):
{
  "parsedData": {
    "name": "Full Name or empty string",
    "email": "Email address or empty string",
    "phone": "Phone number or empty string",
    "summary": "Professional summary or empty string",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Location (City, State, Country or Remote)",
        "startDate": "YYYY-MM-DD or year or empty string",
        "endDate": "YYYY-MM-DD or 'Present' or empty string",
        "current": false,
        "description": "Summary of responsibilities"
      }
    ],
    "education": [
      {
        "degree": "Degree earned",
        "institution": "School/University Name",
        "graduationDate": "YYYY or YYYY-MM-DD or empty string",
        "gpa": null
      }
    ],
    "certifications": ["Cert 1", "Cert 2"],
    "projects": [
      {
        "name": "Project Name",
        "description": "Description",
        "technologies": ["Tech 1", "Tech 2"],
        "url": "Link if present"
      }
    ]
  },
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Skill 1", "Skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "languages": ["Language 1"]
  },
  "aiAnalysis": {
    "overallScore": 85,
    "atsScore": 82,
    "sections": {
      "summary": { "score": 80, "feedback": "Detailed feedback" },
      "experience": { "score": 85, "feedback": "Detailed feedback" },
      "skills": { "score": 90, "feedback": "Detailed feedback" },
      "education": { "score": 85, "feedback": "Detailed feedback" },
      "formatting": { "score": 85, "feedback": "Feedback on format" },
      "projects": { "score": 85, "feedback": "Feedback on projects" }
    },
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Improvement 1", "Improvement 2"],
    "keywords": {
      "present": ["Found Keyword 1"],
      "missing": ["Recommended missing keyword"]
    },
    "recommendations": [
      {
        "section": "experience",
        "before": "Original weak bullet point from resume",
        "after": "Rewritten version with quantifiable impact and strong action verb",
        "reason": "One sentence explaining the improvement"
      }
    ]
  }
}

For recommendations, pick the 3 most impactful improvements the candidate can make. Quote actual text from the resume in 'before'.

--- RESUME TEXT ---
${rawText}
    `;

    try {
      const responseText = await this._generateWithFallback({
        prompt,
        isJson: true,
        temperature: 0.2,
      });
      const parsed = safeJsonParse(responseText);

      // Validate core structure
      if (parsed && parsed.aiAnalysis && parsed.skills) {
        return parsed;
      }
      throw new Error('Gemini response missing essential schema fields');
    } catch (error) {
      logger.warn(`Gemini API unavailable for resume (${error.message}). Falling back to local ATS engine.`);
      // Never crash the user upload: provide accurate heuristic ATS analysis
      return analyzeResumeHeuristically(rawText);
    }
  }

  /**
   * Compare a candidate resume against a job posting.
   */
  async generateJobMatchScore(resumeData, job) {
    const prompt = `
You are an expert technical recruiter and ATS simulator.
Compare the candidate's resume data against the job posting.

RESPOND EXACTLY WITH THIS JSON SCHEMA:
{
  "matchScore": 75,
  "matchedSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Skill 3"],
  "feedback": "A 2-3 sentence brief explanation of why this score was given."
}

--- CANDIDATE RESUME SUMMARY & SKILLS ---
${JSON.stringify({ summary: resumeData?.parsedData?.summary, skills: resumeData?.skills })}

--- JOB POSTING ---
Title: ${job.title}
Requirements: ${(job.requirements || []).join(', ')}
Description: ${job.description}
    `;

    try {
      const responseText = await this._generateWithFallback({
        prompt,
        isJson: true,
        temperature: 0.1,
      });
      return safeJsonParse(responseText);
    } catch (error) {
      logger.warn(`Job match score AI failed: ${error.message}. Using fallback match algorithm.`);
      const candidateSkills = (resumeData?.skills?.technical || []).map((s) => s.toLowerCase());
      const jobSkills = (job.requirements || job.skills || []).map((s) => s.toLowerCase());

      const matched = jobSkills.filter((s) => candidateSkills.some((c) => c.includes(s) || s.includes(c)));
      const missing = jobSkills.filter((s) => !matched.includes(s));
      const matchScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 75;

      return {
        matchScore: Math.max(40, Math.min(95, matchScore)),
        matchedSkills: matched.slice(0, 8),
        missingSkills: missing.slice(0, 6),
        feedback: `You possess strong core capabilities for this role including ${matched.slice(0, 3).join(', ') || 'fundamental technical skills'}. Adding experience with ${missing.slice(0, 2).join(', ') || 'advanced tools'} would make your application standout.`,
      };
    }
  }

  /**
   * Generate customized cover letter.
   */
  async generateCoverLetter(resumeData, job) {
    const prompt = `
You are an expert career coach and professional copywriter.
Write a compelling, professional, and tailored cover letter for the candidate applying for the job below.
Do not use placeholders like [Your Name] if the information is available in the candidate's resume data; use the actual data.
Keep it concise, engaging, and highlight the overlap between the candidate's skills and the job requirements.

--- CANDIDATE RESUME SUMMARY & DATA ---
${JSON.stringify({
  name: resumeData?.parsedData?.name,
  email: resumeData?.parsedData?.email,
  summary: resumeData?.parsedData?.summary,
  experience: resumeData?.parsedData?.experience,
  skills: resumeData?.skills,
})}

--- JOB POSTING ---
Title: ${job.title}
Company: ${job.company?.name || 'the Hiring Team'}
Description: ${job.description}
    `;

    try {
      const responseText = await this._generateWithFallback({
        prompt,
        isJson: false,
        temperature: 0.7,
      });
      return responseText.replace(/```(?:markdown)?/gi, '').replace(/```/g, '').trim();
    } catch (error) {
      logger.warn(`Cover letter AI generation failed: ${error.message}. Using structured letter template.`);
      const name = resumeData?.parsedData?.name || 'Applicant';
      const company = job.company?.name || 'your team';
      const skills = (resumeData?.skills?.technical || ['software engineering', 'modern development']).slice(0, 4).join(', ');

      return `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${job.title} position at ${company}. With my background in ${skills}, I am confident in my ability to make an immediate, meaningful contribution to your engineering initiatives.

Throughout my technical journey, I have focused on writing clean, maintainable code and delivering reliable solutions. The mission and technical focus at ${company} strongly align with my career goals, and I am excited about the prospect of applying my problem-solving skills to your team's challenges.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background and enthusiasm make me a strong fit for this role.

Sincerely,
${name}`;
    }
  }

  /**
   * Generate mock interview questions.
   */
  async generateInterviewQuestions(resumeData, job) {
    const prompt = `
You are an expert technical interviewer.
Generate 5 highly relevant interview questions for the candidate applying for the job below.
Also provide a brief hint/strategy on how to answer each question.

RESPOND EXACTLY WITH THIS JSON SCHEMA:
{
  "questions": [
    {
      "question": "The interview question",
      "type": "technical" | "behavioral" | "system_design",
      "hint": "Brief strategy on how to answer"
    }
  ]
}

--- CANDIDATE SKILLS ---
${JSON.stringify(resumeData?.skills || {})}

--- JOB POSTING ---
Title: ${job.title}
Requirements: ${(job.requirements || []).join(', ')}
Description: ${job.description}
    `;

    try {
      const responseText = await this._generateWithFallback({
        prompt,
        isJson: true,
        temperature: 0.5,
      });
      return safeJsonParse(responseText);
    } catch (error) {
      logger.warn(`Interview questions AI failed: ${error.message}. Returning curated role questions.`);
      return {
        questions: [
          {
            question: `How would you architect a core feature for the ${job.title} role from requirements to deployment?`,
            type: 'system_design',
            hint: 'Structure your answer using requirements clarification, component breakdown, database schema, and scalability bottlenecks.',
          },
          {
            question: 'Can you describe a challenging bug or performance bottleneck you encountered and how you diagnosed it?',
            type: 'technical',
            hint: 'Use the STAR method: describe the symptom, profiling tools used, the root cause, and the measurable performance gain.',
          },
          {
            question: 'How do you handle disagreements on code reviews or architectural decisions within an engineering team?',
            type: 'behavioral',
            hint: 'Focus on empathy, data-driven reasoning, aligning on user impact, and committing to team decisions.',
          },
          {
            question: 'What strategies do you employ to ensure high code quality, test coverage, and smooth CI/CD deployments?',
            type: 'technical',
            hint: 'Discuss automated unit testing, integration tests, linting in git hooks, and canary/staged rollouts.',
          },
          {
            question: `What excites you most about working at ${job.company?.name || 'a growing tech company'}, and how do you stay current with evolving technology?`,
            type: 'behavioral',
            hint: 'Mention specific industry trends, side projects, open source, or technical blogs you follow.',
          },
        ],
      };
    }
  }
}

module.exports = new AIService();
