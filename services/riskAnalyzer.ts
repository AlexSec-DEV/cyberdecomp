import { Finding, RiskLevel, RiskReport, FindingType } from '../types';

const RISK_WEIGHTS: Record<RiskLevel, number> = {
  'CRITICAL': 15,
  'HIGH': 10,
  'MEDIUM': 5,
  'LOW': 1,
  'INFO': 0
};

export const calculateRiskScore = (findings: Finding[]): RiskReport => {
  let score = 0;
  
  if (findings.length === 0) {
    return { score: 0, level: 'INFO' };
  }

  // Base score from individual finding risks
  findings.forEach(finding => {
    score += RISK_WEIGHTS[finding.risk];
  });
  
  // Add bonus points for high-impact findings
  if (findings.some(f => f.type === FindingType.PRODUCTION_URL && f.risk === 'HIGH')) {
    score += 10;
  }
  if (findings.some(f => f.risk === 'CRITICAL')) {
    score += 5;
  }

  // Normalize score to a 0-100 scale. 
  // The max possible score can be high, so we use a non-linear mapping for better distribution.
  const normalizedScore = Math.min(100, Math.round(score));

  let level: RiskLevel;
  if (normalizedScore >= 80) {
    level = 'CRITICAL';
  } else if (normalizedScore >= 60) {
    level = 'HIGH';
  } else if (normalizedScore >= 30) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }
  
  return { score: normalizedScore, level };
};
