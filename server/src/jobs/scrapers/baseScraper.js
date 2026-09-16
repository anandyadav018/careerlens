const { chromium } = require('playwright');
const logger = require('../../config/logger');

// A pool of realistic user-agent strings to rotate
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

class BaseScraper {
  constructor(sourceName, baseUrl) {
    this.sourceName = sourceName;
    this.baseUrl = baseUrl;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialize Playwright with stealth settings to reduce bot detection.
   */
  async init() {
    logger.info(`[${this.sourceName}] Initializing stealth browser...`);
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
      ],
    });

    this.context = await this.browser.newContext({
      userAgent,
      viewport: { width: 1280, height: 900 },
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
      extraHTTPHeaders: {
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    this.page = await this.context.newPage();

    // Hide webdriver flag — the #1 bot detection signal
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-IN', 'en', 'hi'] });
      window.chrome = { runtime: {} };
    });

    // Block unnecessary resources to speed up scraping
    await this.context.route('**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,otf}', route => route.abort());
    await this.context.route('**/analytics/**', route => route.abort());
    await this.context.route('**/tracking/**', route => route.abort());
    await this.context.route('**/ads/**', route => route.abort());
  }

  /**
   * Close all browser resources.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info(`[${this.sourceName}] Browser closed.`);
    }
  }

  /**
   * Random human-like delay to avoid rate limiting.
   * @param {number} minMs
   * @param {number} maxMs
   */
  async delay(minMs = 800, maxMs = 2000) {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Abstract — implemented by child scrapers.
   * Must return an array of normalized job objects.
   */
  async scrape() {
    throw new Error('scrape() must be implemented by child scraper');
  }

  /**
   * Normalize raw scraped fields into the Job model shape.
   */
  normalizeJob(data) {
    return {
      externalId: data.externalId,
      source: this.sourceName,
      sourceUrl: data.url,
      title: (data.title || 'Unknown Title').trim(),
      company: {
        name: (data.companyName || 'Unknown Company').trim(),
        logo: data.companyLogo || '',
      },
      location: {
        city: (data.city || '').trim(),
        state: (data.state || '').trim(),
        country: data.country || 'India',
        isRemote: data.isRemote || false,
      },
      description: (data.description || `${data.title} at ${data.companyName} in India`).trim(),
      requirements: data.requirements || [],
      responsibilities: data.responsibilities || [],
      skills: data.skills || [],
      salary: data.salary || { min: null, max: null, currency: 'INR', period: 'yearly' },
      jobType: data.jobType || 'full-time',
      experienceLevel: data.experienceLevel || 'any',
      postedAt: data.postedAt || new Date(),
    };
  }

  /**
   * Extract skills by matching against a known list
   */
  extractSkills(text = '') {
    const SKILLS = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
      'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'Kotlin', 'Swift',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
      'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
      'Git', 'GitHub', 'CI/CD', 'Jenkins', 'Linux',
      'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
      'Excel', 'Power BI', 'Tableau', 'R', 'Spark',
      'REST API', 'GraphQL', 'gRPC', 'Microservices',
      'React Native', 'Flutter', 'Android', 'iOS',
      'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'C++', 'C#', '.NET',
    ];
    const lower = text.toLowerCase();
    return SKILLS.filter(skill => lower.includes(skill.toLowerCase()));
  }

  /**
   * Parse city from a messy location string
   */
  parseCity(location = '') {
    return location
      .replace(/\s+/g, ' ')
      .trim()
      .split(/[|,/·\n]/)[0]
      .trim() || 'India';
  }

  /**
   * Create a stable externalId from a URL
   */
  urlToId(url = '') {
    return Buffer.from(url).toString('base64url').slice(0, 120);
  }
}

module.exports = BaseScraper;
