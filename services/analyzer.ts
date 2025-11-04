import { Finding, FindingType, RiskLevel } from '../types';

interface Pattern {
    regex: RegExp;
    type: FindingType;
    risk: RiskLevel;
    captureGroup?: number;
}

// Ordered by precedence (more specific patterns first)
const PATTERNS: Pattern[] = [
    // Credentials (CRITICAL/HIGH RISK)
    { regex: /AIza[0-9A-Za-z-_]{35}/g, type: FindingType.GOOGLE_API_KEY, risk: 'CRITICAL' },
    { regex: /AAAA[0-9A-Za-z-_]{100,}/g, type: FindingType.FIREBASE_KEY, risk: 'CRITICAL' },
    { regex: /password["']?\s*[=:]\s*["']([^"']+)["']/gi, type: FindingType.PASSWORD, risk: 'CRITICAL', captureGroup: 1 },
    { regex: /api[_-]?key["']?\s*[=:]\s*["']([^"']+)["']/gi, type: FindingType.GENERIC_API_KEY, risk: 'HIGH', captureGroup: 1 },
    { regex: /token["']?\s*[=:]\s*["']([^"']+)["']/gi, type: FindingType.TOKEN, risk: 'HIGH', captureGroup: 1 },
    { regex: /key=([A-Za-z0-9-_]+)/g, type: FindingType.FCM_SERVER_KEY, risk: 'HIGH', captureGroup: 1 },

    // URLs (by precedence to avoid misclassification)
    { regex: /https?:\/\/[^\s"']*(?:production|release|live)[^\s"']*/gi, type: FindingType.PRODUCTION_URL, risk: 'HIGH' },
    { regex: /https?:\/\/[^\s"']*(?:staging|preprod|test)[^\s"']*/gi, type: FindingType.STAGING_URL, risk: 'MEDIUM' },
    { regex: /https?:\/\/[^\s"']*(?:dev|develop)[^\s"']*/gi, type: FindingType.DEV_URL, risk: 'LOW' },
    { regex: /https?:\/\/[^\s"']+/g, type: FindingType.ENDPOINT, risk: 'LOW' },

    // Other findings
    { regex: /["'](\d{12})["']/g, type: FindingType.FCM_SENDER_ID, risk: 'MEDIUM', captureGroup: 1 },
    { regex: /Java_[\w_]+/g, type: FindingType.JNI_FUNCTION, risk: 'INFO' },
    { regex: /__builtin_strncpy\(\s*\w+\s*,\s*"([^"]+)"\s*,\s*\d+\s*\)/g, type: FindingType.HARDCODED_STRING, risk: 'INFO', captureGroup: 1 },
    { regex: /["']([^"']{20,100})["']/g, type: FindingType.HARDCODED_STRING, risk: 'INFO', captureGroup: 1 },
];

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const analyzeFile = async (file: File): Promise<Finding[]> => {
  const content = await readFileAsText(file);
  const findings: Finding[] = [];
  const foundValues = new Set<string>();

  for (const pattern of PATTERNS) {
      const { regex, type, risk, captureGroup = 0 } = pattern;
      let match;
      regex.lastIndex = 0; // Reset lastIndex for global regexes

      while ((match = regex.exec(content)) !== null) {
          const rawValue = match[captureGroup] || match[0];
          
          if (!rawValue) continue;
          
          const value = rawValue.trim();

          // Avoid adding a generic URL if it's already been classified as a more specific type
          if (type === FindingType.ENDPOINT && foundValues.has(value)) {
              continue;
          }

          if (value && !foundValues.has(value)) {
              findings.push({
                  value,
                  type,
                  risk,
                  fileName: file.name,
              });
              foundValues.add(value);
          }
      }
  }
  
  return findings;
};
