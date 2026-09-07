import { PIIEntity, PrivacySettings, SanitizationResult } from '../types';

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  framework: 'GDPR',
  redactionLevel: 'balanced',
  maskName: true,
  maskEmail: true,
  maskPhone: true,
  maskAddress: true,
  maskLinks: true,
  maskProtectedDemographics: true,
  maskGraduationYears: false,
  clientSideRehydration: true,
};

/**
 * Sanitizes CV text before any transmission to LLM or server.
 * All detected PII is catalogued locally and replaced with anonymous tokens.
 */
export function sanitizeCvText(rawText: string, settings: PrivacySettings = DEFAULT_PRIVACY_SETTINGS): SanitizationResult {
  if (!rawText || !rawText.trim()) {
    return {
      sanitizedText: '',
      entities: [],
      stats: { names: 0, emails: 0, phones: 0, addresses: 0, urls: 0, demographics: 0, gradYears: 0, total: 0 }
    };
  }

  let text = rawText;
  const entities: PIIEntity[] = [];

  // Helper to add entity and replace text
  const replaceAndTrack = (
    regex: RegExp,
    type: PIIEntity['type'],
    tokenPrefix: string,
    label: string
  ) => {
    let matchIndex = 1;
    text = text.replace(regex, (match) => {
      const trimmed = match.trim();
      if (!trimmed) return match;
      
      // Check if already in entities
      const existing = entities.find(e => e.originalValue.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        return existing.token;
      }

      const token = `[${tokenPrefix}_${matchIndex}]`;
      matchIndex++;
      entities.push({
        id: `entity-${entities.length + 1}`,
        type,
        originalValue: trimmed,
        token,
        label
      });
      return token;
    });
  };

  // 1. Email Addresses
  if (settings.maskEmail) {
    replaceAndTrack(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      'EMAIL',
      'EMAIL_ADDRESS',
      'Email Address'
    );
  }

  // 2. Phone Numbers (International, US, UK, EU formats)
  if (settings.maskPhone) {
    replaceAndTrack(
      /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g,
      'PHONE',
      'PHONE_NUMBER',
      'Phone Number'
    );
  }

  // 3. Social & Portfolio Links (LinkedIn, GitHub, Personal portfolio)
  if (settings.maskLinks) {
    // LinkedIn
    replaceAndTrack(
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/gi,
      'URL',
      'LINKEDIN_PROFILE',
      'LinkedIn Profile'
    );
    // GitHub
    replaceAndTrack(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?/gi,
      'URL',
      'GITHUB_PROFILE',
      'GitHub Profile'
    );
    // Personal websites
    replaceAndTrack(
      /(?:https?:\/\/)(?:www\.)?[A-Za-z0-9-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?/gi,
      'URL',
      'PORTFOLIO_URL',
      'Personal Website'
    );
  }

  // 4. Protected Demographics (EEOC, UK Equality Act, GDPR Art. 9)
  if (settings.maskProtectedDemographics) {
    // Date of Birth / Age
    replaceAndTrack(
      /(?:DOB|Date of Birth|Born|Birth Date|Birthdate)\s*[:=-]?\s*(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})/gi,
      'DOB',
      'DATE_OF_BIRTH',
      'Date of Birth'
    );
    replaceAndTrack(
      /\b(?:Age)\s*[:=-]?\s*\d{2}\b/gi,
      'DOB',
      'AGE_DEMOGRAPHIC',
      'Age Declaration'
    );

    // Marital Status
    replaceAndTrack(
      /\b(?:Marital Status|Status)\s*[:=-]?\s*(?:Single|Married|Divorced|Widowed|Civil Partner|Separated)\b/gi,
      'DEMOGRAPHIC',
      'MARITAL_STATUS',
      'Marital Status'
    );

    // Gender / Pronouns
    replaceAndTrack(
      /\b(?:Gender|Sex)\s*[:=-]?\s*(?:Male|Female|Non-binary|Transgender|Man|Woman)\b/gi,
      'DEMOGRAPHIC',
      'GENDER_IDENTITY',
      'Gender / Sex'
    );

    // Nationality / Citizenship
    replaceAndTrack(
      /\b(?:Nationality|Citizenship)\s*[:=-]?\s*[A-Za-z\s]{3,20}\b/gi,
      'DEMOGRAPHIC',
      'NATIONALITY',
      'Nationality / Citizenship'
    );

    // Religion / Faith
    replaceAndTrack(
      /\b(?:Religion|Confession|Konfession)\s*[:=-]?\s*[A-Za-z\s]{3,20}\b/gi,
      'DEMOGRAPHIC',
      'RELIGIOUS_AFFILIATION',
      'Religious Affiliation'
    );

    // Headshot / Photo references
    replaceAndTrack(
      /\b(?:Photo attached|Headshot attached|See attached photo|Photo on request)\b/gi,
      'DEMOGRAPHIC',
      'PHOTO_REMOVED',
      'Photo Reference'
    );
  }

  // 5. Physical Addresses & Postal Codes
  if (settings.maskAddress) {
    // Street Address pattern (e.g., 123 Main Street, Apt 4)
    replaceAndTrack(
      /\b\d{1,5}\s+[A-Za-z0-9\s.,-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|Place|Pl|Square|Sq|Close|Cl)\b(?:[,\s]+(?:Apt|Suite|Unit|Floor|Flat)?\s*[A-Za-z0-9#-]+)?/gi,
      'ADDRESS',
      'STREET_ADDRESS',
      'Street Address'
    );

    // Postal / Zip codes (US, UK, CA, EU)
    replaceAndTrack(
      /\b(?:[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|\d{5}(?:-\d{4})?|[A-CEGHJ-NPR-TV-Z]\d[A-CEGHJ-NPR-TV-Z]\s*\d[A-CEGHJ-NPR-TV-Z]|\d{4,5})\b/g,
      'ADDRESS',
      'POSTAL_CODE',
      'Postal / Zip Code'
    );
  }

  // 6. Name Identification
  if (settings.maskName) {
    // Explicit "Name: Jane Doe" pattern
    const explicitNameRegex = /(?:Name|Full Name)\s*[:=-]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g;
    text = text.replace(explicitNameRegex, (match, p1) => {
      const trimmed = p1.trim();
      const existing = entities.find(e => e.originalValue.toLowerCase() === trimmed.toLowerCase());
      if (existing) return `Name: ${existing.token}`;
      
      const token = '[CANDIDATE_NAME]';
      entities.push({
        id: `entity-name`,
        type: 'NAME',
        originalValue: trimmed,
        token,
        label: 'Candidate Full Name'
      });
      return `Name: ${token}`;
    });

    // Top of CV candidate header detection (first 1-3 lines often start with Candidate Name)
    const lines = text.split('\n');
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const line = lines[i].trim();
      // If line is 2-4 capitalized words without punctuation or keywords like "Resume", "CV", "Summary"
      if (
        line.length > 3 &&
        line.length < 35 &&
        /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(line) &&
        !/^(?:Curriculum Vitae|Resume|Summary|Profile|Contact|Experience|Education)$/i.test(line)
      ) {
        const existing = entities.find(e => e.originalValue.toLowerCase() === line.toLowerCase());
        if (!existing) {
          const token = '[CANDIDATE_NAME]';
          entities.push({
            id: `entity-top-name`,
            type: 'NAME',
            originalValue: line,
            token,
            label: 'Candidate Name (Header)'
          });
          lines[i] = lines[i].replace(line, token);
          text = lines.join('\n');
          break;
        }
      }
    }
  }

  // 7. Graduation Years (Optional Anti-Age Bias)
  if (settings.maskGraduationYears) {
    replaceAndTrack(
      /\b(?:197\d|198\d|199\d|200\d|201[0-5])\b/g,
      'GRAD_YEAR',
      'YEAR_REDACTED',
      'Historical Graduation Year'
    );
  }

  // Calculate statistics
  const stats = {
    names: entities.filter(e => e.type === 'NAME').length,
    emails: entities.filter(e => e.type === 'EMAIL').length,
    phones: entities.filter(e => e.type === 'PHONE').length,
    addresses: entities.filter(e => e.type === 'ADDRESS').length,
    urls: entities.filter(e => e.type === 'URL').length,
    demographics: entities.filter(e => e.type === 'DEMOGRAPHIC' || e.type === 'DOB').length,
    gradYears: entities.filter(e => e.type === 'GRAD_YEAR').length,
    total: entities.length
  };

  return {
    sanitizedText: text,
    entities,
    stats
  };
}

/**
 * Client-Side Re-hydration
 * Restores the user's real personal details into the rewritten CV strictly in client memory.
 * Never transmitted over the wire.
 */
export function rehydrateText(tailoredText: string, entities: PIIEntity[]): string {
  if (!tailoredText || !entities || entities.length === 0) {
    return tailoredText;
  }

  let rehydrated = tailoredText;
  
  // Sort entities by token length descending to avoid partial token collision
  const sortedEntities = [...entities].sort((a, b) => b.token.length - a.token.length);

  for (const entity of sortedEntities) {
    // Global replacement of the token
    const escapedToken = entity.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedToken, 'g');
    rehydrated = rehydrated.replace(regex, entity.originalValue);
  }

  return rehydrated;
}
