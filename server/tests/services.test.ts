import { AIService } from '../services/ai.service';
import { PDFService } from '../services/pdf.service';
import { EmailService } from '../services/email.service';
import { StorageService } from '../services/storage.service';
import { AssessmentData, CareerRecommendation } from '../../shared/schema';

// Mock environment variables
process.env.GEMINI_API_KEY = 'mock-gemini-api-key';
process.env.OPENAI_API_KEY = 'mock-openai-api-key';
process.env.RESEND_API_KEY = 'mock-resend-api-key';

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(JSON.stringify({
              careers: [
                {
                  title: 'Software Engineer',
                  matchPercentage: 95,
                  description: 'Software engineering role...',
                  requiredSkills: ['JavaScript', 'Python', 'React'],
                  icon: 'code',
                }
              ],
              skillGaps: [
                {
                  skill: 'React',
                  proficiency: 0,
                  requiredProficiency: 3,
                }
              ],
              learningPaths: [
                {
                  skill: 'React',
                  resources: [
                    {
                      name: 'React Documentation',
                      url: 'https://reactjs.org',
                      type: 'Documentation',
                    }
                  ]
                }
              ]
            }))
          }
        })
      })
    }))
  };
});

// Mock the html-pdf library
jest.mock('html-pdf', () => ({
  create: jest.fn().mockImplementation(() => ({
    toBuffer: jest.fn((callback) => {
      callback(null, Buffer.from('mock pdf content'));
    })
  }))
}));

// Mock the Resend library
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'mock-email-id' })
    }
  }))
}));

// Mock Service Container
jest.mock('../services/service-container', () => ({
  ServiceContainer: {
    getInstance: () => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAIService: jest.fn().mockReturnValue(new AIService()),
      getPDFService: jest.fn().mockReturnValue(new PDFService()),
      getEmailService: jest.fn().mockReturnValue(new EmailService()),
      get: jest.fn()
    })
  }
}));

describe('Service Tests', () => {
  // Mock assessment data for testing
  const mockAssessmentData: AssessmentData = {
    education: {
      level: 'Bachelor',
      fieldOfStudy: 'Computer Science',
      achievements: 'Dean\'s List',
    },
    skills: {
      technicalSkills: ['JavaScript', 'Python'],
      softSkills: ['Communication', 'Teamwork'],
      skillProficiencies: [
        { skill: 'JavaScript', proficiency: 4 },
        { skill: 'Python', proficiency: 3 },
      ],
    },
    experience: {
      experiences: [
        {
          jobTitle: 'Software Developer',
          company: 'Test Company',
          startDate: '2020-01',
          endDate: '2022-01',
          currentPosition: false,
          responsibilities: 'Developed web applications',
        },
      ],
      industries: ['Technology'],
    },
    interests: {
      careerGoals: 'Senior Developer position',
      interestAreas: ['Web Development', 'Machine Learning'],
      workPreferences: {
        remotePreference: 4,
        teamSizePreference: 3,
      },
    },
  };

  // Mock recommendation result
    const mockRecommendation = {
      careerPaths: [
        {
          title: 'Software Engineer',
          match: 95,
          description: 'Software engineering role...',
          requiredSkills: ['JavaScript', 'Python', 'React'],
          skillGap: {
            skills: ['React'],
            learningPath: ['https://reactjs.org']
          },
          icon: 'code',
        },
      ],
      skillGaps: [
        {
          skill: 'React',
          proficiency: 0,
          requiredProficiency: 3,
        },
      ],
      learningPaths: [
        {
          skill: 'React',
          resources: [
            {
              name: 'React Documentation',
              url: 'https://reactjs.org',
              type: 'Documentation',
            },
          ],
        },
      ],
    } as const;

  describe('AIService', () => {
    let aiService: AIService;

    beforeEach(async () => {
      aiService = new AIService();
      await aiService.initialize();
    });

    it('should generate career recommendations', async () => {
      const result = await aiService.generateCareerRecommendations(mockAssessmentData);
      
      expect(result).toBeDefined();
      expect(result.careers).toBeInstanceOf(Array);
      expect(result.careers.length).toBeGreaterThan(0);
      expect(result.skillGaps).toBeInstanceOf(Array);
      expect(result.learningPaths).toBeInstanceOf(Array);
    });
  });

  describe('PDFService', () => {
    let pdfService: PDFService;

    beforeEach(() => {
      pdfService = new PDFService();
    });

    it('should generate PDF from recommendation data', async () => {
      const pdfBuffer = await pdfService.generatePDF(mockRecommendation);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('EmailService', () => {
    let emailService: EmailService;

    beforeEach(async () => {
      emailService = new EmailService();
      await emailService.initialize();
    });

    it('should send email with career recommendations', async () => {
      const pdfBuffer = Buffer.from('mock pdf content');
      const email = 'test@example.com';
      
      const result = await emailService.sendResultsEmail(email, mockRecommendation, pdfBuffer);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
    });
  });

  describe('StorageService', () => {
    let storageService: StorageService;
    let mockAIService: AIService;

    beforeEach(async () => {
      mockAIService = new AIService();
      jest.spyOn(mockAIService, 'generateCareerRecommendations').mockResolvedValue(mockRecommendation);
      
      storageService = new StorageService();
      await storageService.initialize();
      
      // Inject mock AI service
      Object.defineProperty(storageService, 'aiService', {
        value: mockAIService,
        writable: true
      });
    });

    it('should process assessment data and return recommendations', async () => {
      const result = await storageService.processAssessment(mockAssessmentData);
      
      expect(mockAIService.generateCareerRecommendations).toHaveBeenCalledWith(mockAssessmentData);
      expect(result).toEqual(mockRecommendation);
    });
  });
});