
import { UserLifestyleData, ActivityLevel, RiskLevel, PredictionResult, Consequence, RiskDemographics } from '../types.ts';

export const calculateBMI = (weight: number, height: number): number => {
  if (height === 0) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

const sigmoid = (z: number): number => {
  return 1 / (1 + Math.exp(-z));
};

export const predictLifestyleRisk = (data: UserLifestyleData): PredictionResult => {
  const bmi = calculateBMI(data.weight, data.height);
  let logit = -3.5; 

  const bmiDeviation = Math.abs(bmi - 22.5);
  logit += bmiDeviation * 0.15;
  logit += (data.age - 18) * 0.02;
  if (data.isSmoking) logit += 2.2;
  if (data.isDrinking) logit += 0.6;
  logit += data.activityLevel === ActivityLevel.LOW ? 1.2 
                       : data.activityLevel === ActivityLevel.MEDIUM ? 0.4 
                       : -0.5;
  logit += (data.stressLevel - 5) * 0.25;

  if (data.isSmoking && data.stressLevel > 7) logit += 0.8;
  if (data.activityLevel === ActivityLevel.LOW && bmi > 28) logit += 0.5;

  const probability = sigmoid(logit);
  const impactScore = Math.round(probability * 100);

  let riskLevel: RiskLevel;
  let message: string;
  let consequences: Consequence[] = [];

  if (impactScore < 25) {
    riskLevel = RiskLevel.LOW;
    message = "Your lifestyle metrics indicate a highly resilient physiological profile with minimal health strain.";
    consequences = [
      { area: "Physical Resilience", impact: "High recovery speed after exertion.", longTerm: "Maintains high physical autonomy and mobility well into senior years." },
      { area: "Metabolic Efficiency", impact: "Optimal energy partitioning.", longTerm: "Stable weight management and consistent daily energy." }
    ];
  } else if (impactScore < 60) {
    riskLevel = RiskLevel.MEDIUM;
    message = "Moderate lifestyle-related stressors are present. Current habits may lead to cumulative metabolic strain.";
    consequences = [
      { area: "Inflammatory Drift", impact: "Occasional localized stiffness.", longTerm: "Gradual increase in systemic inflammation over time." },
      { area: "Restorative Quality", impact: "Sleep may feel less refreshing.", longTerm: "Potential for chronic sleep debt impacting focus." }
    ];
  } else {
    riskLevel = RiskLevel.HIGH;
    message = "Multiple high-impact risk indicators detected. Your current habits show significant lifestyle-related health strain.";
    consequences = [
      { area: "Physiological Burnout", impact: "Persistent exhaustion.", longTerm: "Significant erosion of the body's repair mechanisms." },
      { area: "Accelerated Aging", impact: "Biological markers exceeding age.", longTerm: "Early decline in physical strength and overall stamina." }
    ];
  }

  return { riskLevel, score: Math.floor(logit), impactScore, bmi, message, consequences };
};

export const getSyntheticDemographics = (): RiskDemographics => {
  return {
    tierDistribution: [
      { label: 'Low Strain', value: 42, color: '#2dd4bf' },
      { label: 'Moderate', value: 38, color: '#fbbf24' },
      { label: 'High Strain', value: 20, color: '#f43f5e' },
    ],
    primaryDrivers: [
      { label: 'Sedentary Lifestyle', value: 45, color: '#8b5cf6' },
      { label: 'Chronic Stress', value: 32, color: '#06b6d4' },
      { label: 'Substance Habit', value: 23, color: '#f43f5e' },
    ]
  };
};
