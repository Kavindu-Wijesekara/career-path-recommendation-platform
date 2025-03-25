import { 
  AssessmentData, 
  EducationData, 
  SkillData, 
  ExperienceData, 
  InterestData,
  CareerRecommendation
} from "@shared/schema";

export type Step = "education" | "skills" | "experience" | "interests";

export interface StepInfo {
  id: Step;
  title: string;
  icon: string;
}

export interface FormStatus {
  isSubmitting: boolean;
  error: string | null;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  currentPosition?: boolean;
  responsibilities: string;
}

export interface SkillProficiency {
  skill: string;
  proficiency: number;
}

export interface TechSkill {
  id: string;
  name: string;
}

export interface SoftSkill {
  id: string;
  name: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface InterestArea {
  id: string;
  name: string;
  icon: string;
}

export { 
  AssessmentData, 
  EducationData, 
  SkillData, 
  ExperienceData, 
  InterestData,
  CareerRecommendation
};
