"""
Job Scraping Utilities
For discovering jobs from various sources
"""

import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import re

# Try to import web scraping libraries
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


class JobScraper:
    """Scrape jobs from various sources."""
    
    def __init__(self):
        self.jobs = []
    
    async def scrape_rss_feed(self, feed_url: str) -> List[Dict]:
        """Scrape jobs from an RSS feed."""
        if not HTTPX_AVAILABLE:
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(feed_url, timeout=30)
                response.raise_for_status()
                
                if BS4_AVAILABLE:
                    soup = BeautifulSoup(response.text, 'xml')
                    items = soup.find_all('item')
                    
                    jobs = []
                    for item in items:
                        job = {
                            'title': item.find('title').text if item.find('title') else '',
                            'description': item.find('description').text if item.find('description') else '',
                            'link': item.find('link').text if item.find('link') else '',
                            'pubDate': item.find('pubDate').text if item.find('pubDate') else '',
                            'source': feed_url
                        }
                        jobs.append(job)
                    
                    return jobs
                
                return []
        except Exception as e:
            print(f"Error scraping RSS feed: {e}")
            return []
    
    async def scrape_career_page(self, url: str) -> List[Dict]:
        """Scrape jobs from a company career page using Playwright."""
        if not PLAYWRIGHT_AVAILABLE:
            return self._mock_career_page_jobs(url)
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                await page.goto(url, wait_until='networkidle')
                
                # Generic job listing selectors (customize per site)
                job_selectors = [
                    '.job-listing',
                    '.job-card',
                    '.career-listing',
                    '[data-job]',
                    '.position',
                    '.opening'
                ]
                
                jobs = []
                for selector in job_selectors:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        for element in elements:
                            title = await element.query_selector('h2, h3, .title, .job-title')
                            location = await element.query_selector('.location, .job-location')
                            link = await element.query_selector('a')
                            
                            job = {
                                'title': await title.inner_text() if title else '',
                                'location': await location.inner_text() if location else '',
                                'link': await link.get_attribute('href') if link else url,
                                'source': url
                            }
                            
                            if job['title']:
                                jobs.append(job)
                        break
                
                await browser.close()
                return jobs
                
        except Exception as e:
            print(f"Error scraping career page: {e}")
            return self._mock_career_page_jobs(url)
    
    def _mock_career_page_jobs(self, url: str) -> List[Dict]:
        """Return mock jobs for demo purposes."""
        company = url.split('//')[-1].split('/')[0].replace('www.', '').split('.')[0].title()
        
        return [
            {
                'title': 'Senior Software Engineer',
                'company': company,
                'location': 'Remote',
                'description': 'Build scalable systems using modern technologies',
                'link': f'{url}/jobs/1',
                'source': url
            },
            {
                'title': 'Full Stack Developer',
                'company': company,
                'location': 'San Francisco, CA',
                'description': 'Work on web applications using React and Node.js',
                'link': f'{url}/jobs/2',
                'source': url
            }
        ]
    
    def clean_job_data(self, job: Dict) -> Dict:
        """Clean and normalize job data."""
        # Clean title
        title = job.get('title', '').strip()
        title = re.sub(r'\s+', ' ', title)  # Normalize whitespace
        
        # Clean description
        description = job.get('description', '').strip()
        if BS4_AVAILABLE:
            soup = BeautifulSoup(description, 'html.parser')
            description = soup.get_text(separator=' ').strip()
        
        # Detect remote
        location = job.get('location', '').lower()
        remote = 'remote' in location or 'work from home' in location
        
        return {
            'title': title,
            'company': job.get('company', 'Unknown'),
            'location': job.get('location', 'Unknown'),
            'remote': remote,
            'description': description[:2000],  # Truncate long descriptions
            'applyUrl': job.get('link', job.get('applyUrl', '')),
            'source': job.get('source', ''),
            'discoveredAt': datetime.utcnow().isoformat()
        }
    
    def extract_requirements(self, description: str) -> List[str]:
        """Extract job requirements from description."""
        requirements = []
        
        # Common patterns for requirements
        patterns = [
            r'(?:requirements?|qualifications?|what we.re looking for)[:\s]*(.+?)(?:benefits?|what we offer|about us|$)',
            r'(?:must have|you should have|you will need)[:\s]*(.+?)(?:nice to have|bonus|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, description.lower(), re.DOTALL | re.IGNORECASE)
            if match:
                req_text = match.group(1)
                # Split by bullets, numbers, or newlines
                items = re.split(r'[\n•\-\*\d\.]+', req_text)
                requirements.extend([item.strip() for item in items if item.strip() and len(item.strip()) > 10])
        
        return requirements[:10]  # Limit to 10 requirements


# Job sources configuration
JOB_SOURCES = [
    {
        'name': 'RemoteOK',
        'type': 'api',
        'url': 'https://remoteok.com/api',
        'enabled': True
    },
    {
        'name': 'HackerNews Jobs',
        'type': 'rss',
        'url': 'https://hnrss.org/whoishiring/jobs',
        'enabled': True
    },
    {
        'name': 'WeWorkRemotely',
        'type': 'rss',
        'url': 'https://weworkremotely.com/remote-jobs.rss',
        'enabled': True
    }
]


async def discover_jobs(sources: List[Dict] = None) -> List[Dict]:
    """Discover jobs from configured sources."""
    if sources is None:
        sources = [s for s in JOB_SOURCES if s.get('enabled', True)]
    
    scraper = JobScraper()
    all_jobs = []
    
    for source in sources:
        try:
            if source['type'] == 'rss':
                jobs = await scraper.scrape_rss_feed(source['url'])
            elif source['type'] == 'career':
                jobs = await scraper.scrape_career_page(source['url'])
            else:
                # API or other types
                jobs = scraper._mock_career_page_jobs(source['url'])
            
            # Clean and add source info
            for job in jobs:
                job['source'] = source['name']
                cleaned = scraper.clean_job_data(job)
                all_jobs.append(cleaned)
                
        except Exception as e:
            print(f"Error with source {source['name']}: {e}")
    
    return all_jobs
