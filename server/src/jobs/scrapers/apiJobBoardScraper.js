const BaseScraper = require('./baseScraper');
const logger = require('../../config/logger');

// Define API sources
const API_JOB_SOURCES = {
  arbeitnow: {
    name: 'Arbeitnow',
    url: 'https://www.arbeitnow.com/api/job-board-api',
    type: 'json'
  },
  remoteok: {
    name: 'RemoteOK',
    url: 'https://remoteok.com/api',
    type: 'json'
  }
};

const normalizeJobType = (type = '') => {
  const value = type.toLowerCase().trim();
  if (value.includes('full-time') || value.includes('full time') || value === 'fulltime') return 'full-time';
  if (value.includes('part-time') || value.includes('part time') || value === 'parttime') return 'part-time';
  if (value.includes('contract') || value.includes('temporary')) return 'contract';
  if (value.includes('intern') || value.includes('co-op')) return 'internship';
  if (value.includes('freelance')) return 'freelance';
  return 'other';
};

class ApiJobBoardScraper extends BaseScraper {
  constructor(sourceKey) {
    const source = API_JOB_SOURCES[sourceKey];
    if (!source) throw new Error(`Unknown API job source: ${sourceKey}`);
    super(sourceKey, source.url);
    this.source = source;
  }

  // Override browser initialization for API requests
  async init() {}
  async close() {}

  async scrape() {
    logger.info(`[${this.sourceName}] Collecting jobs from ${this.source.name} API...`);
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (this.sourceName === 'arbeitnow') {
        const rawJobs = data.data || [];
        return rawJobs.map((job, index) => this.normalizeJob({
          externalId: job.slug || `arbeitnow-${Date.now()}-${index}`,
          url: job.url,
          title: job.title,
          companyName: job.company_name,
          city: job.location || '',
          country: 'Germany',
          isRemote: job.remote || false,
          description: job.description || '',
          skills: job.tags || [],
          jobType: normalizeJobType(job.job_types && job.job_types[0] ? job.job_types[0] : 'full-time'),
        }));
      }

      if (this.sourceName === 'remoteok') {
        // RemoteOk returns an array where first element is metadata
        const rawJobs = Array.isArray(data) ? data.slice(1) : [];
        return rawJobs.map((job, index) => this.normalizeJob({
          externalId: job.slug || `remoteok-${job.id || Date.now()}-${index}`,
          url: job.url || job.apply_url,
          title: job.position,
          companyName: job.company,
          city: job.location ? job.location.split(',')[0].trim() : 'Remote',
          country: job.location ? job.location.split(',')[1]?.trim() || '' : 'Global',
          isRemote: true,
          description: job.description || '',
          skills: job.tags || [],
          jobType: 'full-time', // RemoteOk is predominantly full-time, or can normalize from tags if available
          salary: {
            min: job.salary_min || null,
            max: job.salary_max || null,
            currency: 'USD',
            period: 'yearly'
          }
        }));
      }

      return [];
    } catch (error) {
      logger.error(`[${this.sourceName}] API Scraping failed: ${error.message}`);
      return [];
    }
  }
}

module.exports = { ApiJobBoardScraper, API_JOB_SOURCES };
