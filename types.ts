
export enum ActivityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum RiskLevel {
  LOW = 'Low Risk',
  MEDIUM = 'Medium Risk',
  HIGH = 'High Risk'
}

export interface UserLifestyleData {
  age: number;
  height: number; // cm
  weight: number; // kg
  isSmoking: boolean;
  isDrinking: boolean;
  activityLevel: ActivityLevel;
  stressLevel: number; // 1-10
}

export interface Consequence {
  area: string;
  impact: string;
  longTerm: string;
}

export interface PredictionResult {
  riskLevel: RiskLevel;
  score: number;
  impactScore: number; 
  bmi: number;
  message: string;
  consequences: Consequence[];
}

export interface DemographicStat {
  label: string;
  value: number; // Percentage
  color: string;
}

export interface RiskDemographics {
  tierDistribution: DemographicStat[];
  primaryDrivers: DemographicStat[];
}
