import { AssessmentData, CareerRecommendation } from "@shared/schema";
import { BaseService } from "./base.service";
import { AIService } from "./ai.service";
import { ServiceContainer } from "./service-container";

/**
 * Storage service class that implements IStorage interface
 */
export class StorageService extends BaseService {
  private aiService!: AIService;

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Get AIService from ServiceContainer
    this.aiService = ServiceContainer.getInstance().getAIService();
  }

  /**
   * Process assessment data to get career recommendations
   * @param assessmentData User's assessment data
   * @returns Career recommendations
   */
  async processAssessment(assessmentData: AssessmentData): Promise<CareerRecommendation> {
    try {
      return await this.aiService.generateCareerRecommendations(assessmentData);
    } catch (error) {
      console.error("Error processing assessment:", error);
      throw error;
    }
  }
}