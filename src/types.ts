export type ComplianceFramework = 'GDPR' | 'EEOC' | 'CCPA' | 'INTERNATIONAL';

export type RedactionLevel = 'maximum' | 'balanced' | 'contact_only';

export type ResumeTone = 'impact_driven' | 'executive' | 'technical' | 'concise';

export interface RegionalPreset {
  id: string;
  country: string;
  flag: string;
  title: string;
  spelling: 'US' | 'UK' | 'AU' | 'CA' | 'EU';
  pageStandard: string;
  antiBiasRules: string[];
  guidelines: string[];
  recommendedSections: string[];
}

export interface PrivacySettings {
  framework: ComplianceFramework;
  redactionLevel: RedactionLevel;
  maskName: boolean;
  maskEmail: boolean;
  maskPhone: boolean;
  maskAddress: boolean;
  maskLinks: boolean;
  maskProtectedDemographics: boolean; // gender, marital status, nationality, DOB
  maskGraduationYears: boolean; // age-bias protection for 10+ years
  clientSideRehydration: boolean;
}

export interface PIIEntity {
  id: string;
  type: 'NAME' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'URL' | 'DOB' | 'DEMOGRAPHIC' | 'GRAD_YEAR';
  originalValue: string;
  token: string;
  label: string;
}

export interface SanitizationResult {
  sanitizedText: string;
  entities: PIIEntity[];
  stats: {
    names: number;
    emails: number;
    phones: number;
    addresses: number;
    urls: number;
    demographics: number;
    gradYears: number;
    total: number;
  };
}

export interface RewriteKeyChange {
  section: string;
  explanation: string;
  impact: string;
}

export interface RewriteResult {
  tailoredCvMarkdown: string;
  executiveSummary: string;
  matchScore: number;
  matchedSkills: string[];
  highlightedSkills: string[];
  gapSkills: string[];
  keyChanges: RewriteKeyChange[];
  regionalComplianceNotes: string[];
  antiBiasNotice: string;
  regionalFormatApplied: string;
}

export interface ServerAuditInfo {
  timestamp: string;
  dataRetained: false;
  piiScrubbed: boolean;
  frameworkCompliance: string;
  modelUsed: string;
  ephemeralSessionId: string;
}
