import { AssessmentData, CareerRecommendation } from "@shared/schema";

// The application doesn't store any user data permanently
// Only need methods to process the assessment and get recommendations

export interface IStorage {
  processAssessment(assessmentData: AssessmentData): Promise<CareerRecommendation>;
}

export class MemStorage implements IStorage {
  constructor() {}

  async processAssessment(assessmentData: AssessmentData): Promise<CareerRecommendation> {
    // This method will call the AI service to process the assessment
    // But it doesn't actually store anything

    throw new Error("This method should be implemented by the AI service");
  }
}

export const storage = new MemStorage();
