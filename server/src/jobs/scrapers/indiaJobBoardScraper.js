const BaseScraper = require('./baseScraper');
const logger = require('../../config/logger');

/**
 * India Job Boards — Playwright-based scrapers
 *
 * Each board is a self-contained config. The scraper uses multiple selector
 * fallbacks so minor DOM updates don't break everything at once.
 *
 * Sources chosen for accessibility (low bot-detection, public listing pages):
 *   - internshala  : Internships + fresher jobs, very scrapable
 *   - timesjobs    : Mid-level India jobs
 *   - shine        : Broad India job board
 *   - indeed_india : Widest coverage, harder to scrape but worth trying
 */
const INDIA_JOB_BOARDS = {
  internshala: {
    name: 'Internshala',
    url: 'https://internshala.com/jobs/computer-science-jobs/',
    waitFor: '.individual_internship',
    cards: '.individual_internship',
  },
  timesjobs: {
    name: 'TimesJobs',
    url: 'https://www.timesjobs.com/candidate/job-search.html?from=submit&actualTxtKeywords=software+developer&txtLocation=India&sequence=1&startPage=1',
    waitFor: '.job-bx, article.clearfix',
    cards: '.job-bx, article.clearfix',
  },
  shine: {
    name: 'Shine',
    url: 'https://www.shine.com/job-search/software-engineer-jobs-in-india/1/',
    waitFor: '.jobCard, .job-listing-card',
    cards: '.jobCard, .job-listing-card',
  },
  indeed_india: {
    name: 'Indeed India',
    url: 'https://in.indeed.com/jobs?q=software+developer&l=India&sort=date',
    waitFor: '.job_seen_beacon, [data-testid="job-card-container"]',
    cards: '.job_seen_beacon, [data-testid="job-card-container"]',
  },
};

/**
 * Multi-selector helper — tries each selector in order, returns first match.
 */
const trySelectors = (element, selectors) => {
  for (const sel of selectors) {
    try {
      const el = element.querySelector(sel);
      if (el && el.textContent.trim()) return el.textContent.replace(/\s+/g, ' ').trim();
    } catch (_) { /* selector may be invalid, skip */ }
  }
  return '';
};

/**
 * Get absolute URL from href + base
 */
const absoluteUrl = (href = '', base = '') => {
  try { return new URL(href, base).href; } catch { return ''; }
};

class IndiaJobBoardScraper extends BaseScraper {
  constructor(sourceKey) {
    const board = INDIA_JOB_BOARDS[sourceKey];
    if (!board) throw new Error(`Unknown India job board: ${sourceKey}`);
    super(sourceKey, board.url);
    this.board = board;
  }

  async scrape() {
    await this.init();
    const jobs = [];

    try {
      logger.info(`[${this.sourceName}] Navigating to ${this.board.name}...`);

      // Navigate with a generous timeout — some India sites are slow
      await this.page.goto(this.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });

      // Human-like pause — let JS render
      await this.delay(2000, 3500);

      // Try to wait for job cards to appear
      try {
        await this.page.waitForSelector(this.board.waitFor, { timeout: 12000 });
      } catch (_) {
        logger.warn(`[${this.sourceName}] Card selector timed out — attempting page evaluation anyway.`);
      }

      // Additional pause for dynamic content
      await this.delay(1000, 2000);

      // Extract jobs from the DOM — run inside page context
      const rawJobs = await this.page.evaluate(
        ({ cardSelector, baseUrl, sourceName }) => {
          const text = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
          const absUrl = href => { try { return new URL(href, baseUrl).href; } catch { return ''; } };
          const seen = new Set();

          // querySelectorAll doesn't support comma-list on all browsers within evaluate
          // So split and merge
          const selectors = cardSelector.split(',').map(s => s.trim());
          const cards = [];
          selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              if (!cards.includes(el)) cards.push(el);
            });
          });

          return cards.slice(0, 50).map((card, index) => {
            // Title — try multiple patterns
            const titleEl =
              card.querySelector('h2 a, h3 a, h1 a') ||
              card.querySelector('[class*="title" i] a, [class*="heading" i] a') ||
              card.querySelector('[class*="designation" i] a, [class*="profile" i] a') ||
              card.querySelector('a[href*="/jobs/"], a[href*="/job-detail/"], a[href*="/detail/"]') ||
              card.querySelector('h2, h3, h1, [class*="title" i], [class*="designation" i]');

            const title = text(titleEl);
            if (!title || title.length < 3) return null;

            // URL
            const linkEl = titleEl?.closest('a') || card.querySelector('a[href]');
            const url = absUrl(linkEl?.getAttribute('href') || '');
            if (!url || url === baseUrl) return null;

            // Dedup
            if (seen.has(url)) return null;
            seen.add(url);

            // Location
            const locationEl =
              card.querySelector('[class*="location" i], [class*="loc" i], [class*="place" i]') ||
              card.querySelector('label[class*="srp" i]');
            const location = text(locationEl);

            // Company
            const companyEl =
              card.querySelector('[class*="company" i], [class*="employer" i], [class*="comp-name" i], [class*="org" i]') ||
              card.querySelector('[class*="recruiter" i], [class*="brand" i]');
            let company = text(companyEl);
            if (location && company.includes(location)) {
              company = company.replace(location, '').trim();
            }

            // Experience
            const expEl = card.querySelector('[class*="exp" i], [class*="experience" i]');
            const experience = text(expEl);

            // Description snippet
            const descEl = card.querySelector(
              '[class*="desc" i], [class*="summary" i], [class*="snippet" i], [class*="job-description" i]'
            );
            const description = text(descEl) || text(card).slice(0, 500);

            // Salary
            const salaryEl = card.querySelector(
              '[class*="salary" i], [class*="ctc" i], [class*="stipend" i], [class*="compensation" i]'
            );
            const salaryText = text(salaryEl);

            return { title, url, company, location, experience, description, salaryText };
          }).filter(Boolean);
        },
        { cardSelector: this.board.cards, baseUrl: this.baseUrl, sourceName: this.sourceName }
      );

      logger.info(`[${this.sourceName}] Extracted ${rawJobs.length} raw listings.`);

      for (const raw of rawJobs) {
        const isRemote = /remote|work.?from.?home|wfh/i.test(raw.location + raw.title + raw.description);
        const city = this.parseCity(raw.location);
        const salary = this.parseSalaryINR(raw.salaryText);
        const experienceLevel = this.parseExperienceLevel(raw.experience + raw.title + raw.description);

        jobs.push(this.normalizeJob({
          externalId: this.urlToId(raw.url),
          url: raw.url,
          title: raw.title,
          companyName: raw.company,
          city,
          country: 'India',
          isRemote,
          description: raw.description || `${raw.title} at ${raw.company || 'a company'} in India.`,
          skills: this.extractSkills(`${raw.title} ${raw.description}`),
          salary,
          jobType: 'full-time',
          experienceLevel,
        }));
      }
    } catch (err) {
      logger.error(`[${this.sourceName}] Scrape failed: ${err.message}`);
    } finally {
      await this.close();
    }

    return jobs;
  }

  /**
   * Parse Indian salary strings like "₹3L - 5L", "3,00,000 - 5,00,000", "₹25,000/month"
   */
  parseSalaryINR(text = '') {
    if (!text) return { min: null, max: null, currency: 'INR', period: 'yearly' };
    try {
      // Remove currency symbols and clean
      const clean = text.replace(/[₹,\s]/g, '').toLowerCase();

      // LPA pattern: "3-5lpa" or "3l-5l"
      const lpaMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:l|lpa).*?(\d+(?:\.\d+)?)\s*(?:l|lpa)/);
      if (lpaMatch) {
        return {
          min: Math.round(parseFloat(lpaMatch[1]) * 100000),
          max: Math.round(parseFloat(lpaMatch[2]) * 100000),
          currency: 'INR',
          period: 'yearly',
        };
      }

      // Single LPA: "5lpa" or "upto 8l"
      const singleLpa = clean.match(/(\d+(?:\.\d+)?)\s*(?:l|lpa)/);
      if (singleLpa) {
        const val = Math.round(parseFloat(singleLpa[1]) * 100000);
        return { min: val, max: null, currency: 'INR', period: 'yearly' };
      }

      // Monthly stipend: "15000/month"
      const monthlyMatch = clean.match(/(\d+)\/month/);
      if (monthlyMatch) {
        return { min: parseInt(monthlyMatch[1]), max: null, currency: 'INR', period: 'monthly' };
      }
    } catch (_) { /* ignore */ }
    return { min: null, max: null, currency: 'INR', period: 'yearly' };
  }

  /**
   * Infer experience level from text
   */
  parseExperienceLevel(text = '') {
    const t = text.toLowerCase();
    if (/fresher|entry.?level|0.?year|no.?exp|intern/i.test(t)) return 'entry';
    if (/senior|lead|principal|staff|architect|8\+|7\+|6\+/i.test(t)) return 'senior';
    if (/manager|director|vp|head|executive/i.test(t)) return 'executive';
    if (/3.?year|4.?year|5.?year|mid.?level|mid.?senior/i.test(t)) return 'mid';
    return 'any';
  }
}

module.exports = { IndiaJobBoardScraper, INDIA_JOB_BOARDS };
