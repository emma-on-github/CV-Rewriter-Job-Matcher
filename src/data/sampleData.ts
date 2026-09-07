export interface SampleCV {
  id: string;
  role: string;
  country: string;
  rawText: string;
}

export interface SampleJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

export const SAMPLE_CVS: SampleCV[] = [
  {
    id: 'swe-lead',
    role: 'Lead Cloud / Full-Stack Engineer',
    country: 'US',
    rawText: `Alex Morgan
alex.morgan92@emailprovider.com | +1 (555) 234-8901 | linkedin.com/in/alexmorgan-dev
1420 Pine Street, Apt 3B, Seattle, WA 98101
DOB: 14/05/1991 | Marital Status: Single | Nationality: American

PROFESSIONAL SUMMARY
Experienced Software Engineer with 7+ years developing web services and cloud architectures. Proficient in TypeScript, React, Node.js, and AWS. Passionate about system scalability and team mentorship.

WORK EXPERIENCE
Senior Full-Stack Developer | CloudSphere Inc., Seattle, WA | 2021 – Present
- Built and maintained customer-facing dashboard using React and Node.js.
- Managed AWS infrastructure utilizing ECS, Docker containers, and PostgreSQL.
- Collaborated with product designers and junior developers to ship quarterly roadmap deliverables.
- Reduced build pipeline latency by 30% through caching and bundler improvements.

Software Engineer | NextGen Digital, Austin, TX | 2018 – 2021
- Developed RESTful APIs in Node.js and Express handling 2M requests/day.
- Integrated Stripe payment gateway and authentication flows with OAuth2.
- Wrote automated unit and integration tests achieving 85% test coverage in Jest.
- Participated in bi-weekly sprint planning, retrospectives, and peer code reviews.

Junior Developer | ByteCraft Studio | 2016 – 2018
- Created interactive UI components using JavaScript and HTML5/CSS3.
- Fixed front-end bugs and enhanced accessibility compliance.

EDUCATION
Bachelor of Science in Computer Science | University of Washington | 2016

CORE SKILLS
JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Docker, AWS (ECS, S3), Git, CI/CD, Jest`
  },
  {
    id: 'marketing-lead',
    role: 'Senior Growth Marketing Manager',
    country: 'UK',
    rawText: `Sarah Jenkins
sarah.jenkins.marketing@corporate.co.uk | +44 7700 900452 | linkedin.com/in/sarahjenkins-growth
24 Kensington Court, London W8 5DL, United Kingdom
Date of Birth: 22/08/1989 | Marital Status: Married

PROFESSIONAL PROFILE
Results-oriented Marketing Lead with 8 years of B2B SaaS growth and demand generation experience across European and global markets. Track record of driving qualified pipeline through multi-channel digital acquisition, SEO, and content strategy.

CAREER HISTORY
Lead Growth Marketing Manager | SaaSFlow Ltd, London | 2021 – Present
- Responsible for £1.4M annual acquisition marketing budget across paid search, LinkedIn, and programmatic.
- Increased inbound sales-qualified leads (SQLs) by 42% year-on-year.
- Led cross-functional team of 4 content creators and performance marketing specialists.
- Managed HubSpot CRM marketing automation workflows and customer segmentation.

Digital Marketing Specialist | FinTech Pulse, London | 2017 – 2021
- Executed paid acquisition campaigns on Google Ads and Meta with focus on CAC efficiency.
- Produced data-driven whitepapers and case studies generating 8,000+ organic downloads.
- Conducted regular A/B testing on landing pages, boosting sign-up conversion rate from 2.1% to 3.8%.

EDUCATION & QUALIFICATIONS
MSc Strategic Marketing (Distinction) | Imperial College London | 2017
BA (Hons) Business Management (First Class) | University of Bristol | 2015

SKILLS & TOOLS
Growth Strategy, B2B Demand Gen, SEO/SEM, HubSpot, Google Analytics 4, Mixpanel, A/B Testing, Team Leadership`
  }
];

export const SAMPLE_JOBS: SampleJob[] = [
  {
    id: 'job-stripe',
    title: 'Senior Full-Stack Cloud Engineer',
    company: 'FinTech Platform (Stripe Partner)',
    location: 'United States (Remote)',
    description: `About the Role:
We are seeking a Senior Full-Stack Cloud Engineer to architect and scale our mission-critical global payments platform. You will spearhead high-throughput financial microservices, modernize our containerized infrastructure, and enhance platform reliability.

Key Requirements:
- 5+ years of production experience in TypeScript, React, and server-side Node.js/Express.
- Deep expertise in cloud infrastructure (AWS or GCP), including Docker containerization, Kubernetes, and serverless compute.
- Strong track record in relational database optimization (PostgreSQL/SQL), transactional integrity, and data security compliance (PCI-DSS, SOC-2).
- Demonstrated experience designing resilient REST/GraphQL APIs and asynchronous event-driven queues (Kafka or RabbitMQ).
- Excellent communication skills, mentorship experience, and rigorous automated testing practices.

Preferred Qualifications:
- Experience in FinTech, payment processing, or banking APIs.
- Experience with performance monitoring tools (Datadog, OpenTelemetry) and CI/CD pipelines.`
  },
  {
    id: 'job-growth',
    title: 'Director of Growth Marketing',
    company: 'Enterprise SaaS Solutions',
    location: 'United Kingdom (London / Hybrid)',
    description: `The Opportunity:
We are searching for a high-impact B2B SaaS Growth Marketing Leader to orchestrate our international expansion. You will own the full demand generation engine, optimize multi-touch attribution, and align closely with Enterprise sales teams.

Key Responsibilities & Requirements:
- Proven success owning demand generation, lifecycle marketing, and customer acquisition for a B2B SaaS scale-up.
- Deep hands-on proficiency with marketing automation suites (HubSpot or Marketo), CRM data hygiene (Salesforce), and product analytics (GA4, Segment).
- Ability to manage and allocate multi-million-pound media budgets, prioritizing payback period and CAC:LTV efficiency.
- Experience scaling outbound ABM (Account-Based Marketing) campaigns for Mid-Market and Enterprise tiers.
- Exceptional analytical mindset with aptitude for SQL/BI reporting and funnel conversion rate optimization (CRO).`
  }
];
