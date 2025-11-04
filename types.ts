export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export enum FindingType {
  GOOGLE_API_KEY = "Google API Key",
  FIREBASE_KEY = "Firebase Key",
  FCM_SERVER_KEY = "FCM Server Key",
  FCM_SENDER_ID = "FCM Sender ID",
  PRODUCTION_URL = "Production URL",
  STAGING_URL = "Staging URL",
  DEV_URL = "Development URL",
  ENDPOINT = "API Endpoint",
  PASSWORD = "Password",
  TOKEN = "Token",
  GENERIC_API_KEY = "Generic API Key",
  JNI_FUNCTION = "JNI Function",
  HARDCODED_STRING = "Hardcoded String",
}

export interface Finding {
  value: string;
  type: FindingType;
  fileName: string;
  risk: RiskLevel;
}

export type AnalysisResults = Record<string, Finding[]>;

export interface RiskReport {
    score: number;
    level: RiskLevel;
}
