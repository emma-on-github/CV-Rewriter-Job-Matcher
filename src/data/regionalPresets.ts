import { RegionalPreset } from '../types';

export const REGIONAL_PRESETS: RegionalPreset[] = [
  {
    id: 'US',
    country: 'United States',
    flag: '🇺🇸',
    title: 'US Resume (EEOC & ATS Standard)',
    spelling: 'US',
    pageStandard: 'Strict 1 page (under 10 yrs exp) or 2 pages max',
    antiBiasRules: [
      'Strictly NO profile photos (immediate rejection risk under US hiring laws)',
      'NO date of birth, age, marital status, or citizenship statements',
      'EEOC compliant: blind screening friendly, neutral pronouns',
      'Remove graduation years older than 10-15 years to prevent age bias'
    ],
    guidelines: [
      'American English spelling (e.g., optimized, organized, modeling)',
      'Action-verb driven bullet points (STAR: Situation, Task, Action, Result)',
      'Quantified business outcomes ($ revenue, % efficiency, team size)',
      'Reverse chronological work history format'
    ],
    recommendedSections: [
      'Contact Information',
      'Professional Summary',
      'Core Competencies / Technical Skills',
      'Professional Experience',
      'Education',
      'Certifications / Awards'
    ]
  },
  {
    id: 'UK',
    country: 'United Kingdom',
    flag: '🇬🇧',
    title: 'UK Curriculum Vitae (Equality Act 2010)',
    spelling: 'UK',
    pageStandard: 'Standard 2 pages',
    antiBiasRules: [
      'NO photo required or advised',
      'Equality Act 2010 protected characteristics omitted (age, race, religion, marital status)',
      'No NI (National Insurance) number on CV'
    ],
    guidelines: [
      'British English spelling (e.g., optimised, organised, programme)',
      'Compelling Personal Statement (3-4 lines) at top',
      'Education qualifications clearly noted (Degree classification, A-Levels, GCSEs)',
      'Professional tone with clear responsibility and achievement distinction'
    ],
    recommendedSections: [
      'Personal Details',
      'Personal Statement',
      'Key Skills & Expertise',
      'Employment History',
      'Education & Qualifications',
      'Professional Development / Memberships'
    ]
  },
  {
    id: 'EU',
    country: 'European Union / Germany (DACH)',
    flag: '🇪🇺',
    title: 'EU / German Lebenslauf (GDPR & AGG Compliant)',
    spelling: 'EU',
    pageStandard: '1-2 pages (clear, structured layout)',
    antiBiasRules: [
      'GDPR Article 6/9 data minimization enforced',
      'General Equal Treatment Act (AGG) compliant',
      'No religious confession (Konfession) or parents information',
      'Modern international standard: photo optional, omitted for blind screening'
    ],
    guidelines: [
      'Structured chronological layout with exact month/year dates',
      'CEFR language scale standards (e.g., German C2 - Native, English C1 - Fluent)',
      'Clear listing of vocational training, technical certificates, and diplomas',
      'Concise, factual descriptions of core duties and technologies'
    ],
    recommendedSections: [
      'Contact Data',
      'Executive Profile',
      'Professional Experience (Berufserfahrung)',
      'Education & Training (Ausbildung & Studium)',
      'Language Proficiencies (CEFR)',
      'Technical Skills & Certifications'
    ]
  },
  {
    id: 'CA',
    country: 'Canada',
    flag: '🇨🇦',
    title: 'Canadian Resume (CHRA Compliant)',
    spelling: 'CA',
    pageStandard: '1-2 pages',
    antiBiasRules: [
      'Canadian Human Rights Act compliant: no photo, no SIN (Social Insurance Number)',
      'No age, marital status, or nationality',
      'Right to work in Canada can be noted simply if requested'
    ],
    guidelines: [
      'Bilingual awareness (French/English proficiencies highlighted if relevant)',
      'Impact-focused bullet points emphasizing leadership and teamwork',
      'Clear company descriptions if previous employers are international'
    ],
    recommendedSections: [
      'Contact Information',
      'Professional Profile',
      'Skills Summary',
      'Work Experience',
      'Education & Accreditations'
    ]
  },
  {
    id: 'AU',
    country: 'Australia & New Zealand',
    flag: '🇦🇺',
    title: 'AU/NZ Curriculum Vitae (Fair Work Standard)',
    spelling: 'AU',
    pageStandard: '2-3 pages standard',
    antiBiasRules: [
      'Fair Work Act anti-discrimination standards',
      'No photo, no age, no marital status',
      'Visa / Australian working rights acknowledged'
    ],
    guidelines: [
      'Australian English spelling (e.g., prioritised, analysed)',
      'Comprehensive Key Competencies table or bullet matrix',
      'Career Overview / History table followed by detailed achievements',
      'Referee statement ("Available on request" or nominated referees)'
    ],
    recommendedSections: [
      'Personal Details',
      'Career Objective / Executive Summary',
      'Key Competencies & Technical Skills',
      'Professional Experience',
      'Education & Professional Training',
      'Referees'
    ]
  },
  {
    id: 'GLOBAL',
    country: 'International / Remote',
    flag: '🌐',
    title: 'Global ATS-Optimized Format',
    spelling: 'US',
    pageStandard: '1-2 pages universal',
    antiBiasRules: [
      'Universal data privacy and anti-bias standard',
      'Zero sensitive demographic declarations',
      'Clean parseable headings for global Applicant Tracking Systems'
    ],
    guidelines: [
      'Time-zone and remote collaboration proficiencies',
      'Universally recognized technical stacks and terminology',
      'High keyword alignment with international job specs'
    ],
    recommendedSections: [
      'Summary',
      'Core Capabilities',
      'Experience',
      'Education',
      'Certifications & Projects'
    ]
  }
];
