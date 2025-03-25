import express, { Express } from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { AssessmentData, CareerRecommendation } from '../../shared/schema';
import { storage } from '../storage';

// Mock storage implementation
jest.mock('../storage', () => ({
  storage: {
    processAssessment: jest.fn(),
  },
}));

// Mock service container to prevent actual service initialization
jest.mock('../services/service-container', () => ({
  ServiceContainer: {
    getInstance: () => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAIService: jest.fn(),
      getPDFService: jest.fn().mockReturnValue({
        generatePDF: jest.fn().mockResolvedValue(Buffer.from('test pdf content')),
      }),
      getEmailService: jest.fn().mockReturnValue({
        sendResultsEmail: jest.fn().mockResolvedValue({ id: 'email-id' }),
      }),
      get: jest.fn(),
    }),
  },
}));

describe('API Routes', () => {
  let app: Express;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll((done) => {
    if (server && server.close) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/assessment', () => {
    it('should process valid assessment data', async () => {
      // Arrange
      const validAssessmentData: AssessmentData = {
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

      const mockRecommendation: CareerRecommendation = {
        careerPaths: [
          {
            title: 'Software Engineer',
            match: 95,
            description: 'Software engineering role...',
            requiredSkills: ['JavaScript', 'Python', 'React'],
            skillGap: {
              skills: ['React'],
              learningPath: ['https://reactjs.org'],
            },
            icon: 'code',
          },
        ],
      };

      // Mock storage response
      (storage.processAssessment as jest.Mock).mockResolvedValueOnce(mockRecommendation);

      // Act
      const response = await request(app)
        .post('/api/assessment')
        .send(validAssessmentData)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(storage.processAssessment).toHaveBeenCalledWith(validAssessmentData);
      expect(response.body).toEqual(mockRecommendation);
    });

    it('should return 400 for invalid assessment data', async () => {
      // Arrange - invalid data is missing required fields
      const invalidAssessmentData = {
        education: {
          // Missing highestLevel
          fieldOfStudy: 'Computer Science',
        },
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/assessment')
        .send(invalidAssessmentData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(storage.processAssessment).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/assessment/pdf', () => {
    it('should generate PDF for valid assessment result', async () => {
      // Arrange
      const mockRecommendation: CareerRecommendation = {
        careerPaths: [
          {
            title: 'Software Engineer',
            match: 95,
            description: 'Software engineering role...',
            requiredSkills: ['JavaScript', 'Python', 'React'],
            skillGap: {
              skills: ['React'],
              learningPath: ['https://reactjs.org'],
            },
            icon: 'code',
          },
        ],
      };

      // Act
      const response = await request(app)
        .post('/api/assessment/pdf')
        .send(mockRecommendation)
        .expect('Content-Type', /pdf/)
        .expect(200);

      // Assert
      // Should receive buffer from PDF service
      expect(response.body).toBeTruthy();
    });

    it('should return 400 for invalid PDF request data', async () => {
      // Arrange - invalid data missing required career fields
      const invalidRecommendation = {
        careers: [
          {
            // Missing title and other required fields
            matchPercentage: 95,
          },
        ],
      };

      // Act & Assert
      await request(app)
        .post('/api/assessment/pdf')
        .send(invalidRecommendation)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('POST /api/assessment/email', () => {
    it('should send email with career recommendations', async () => {
      // Arrange
      const emailRequest = {
        email: 'test@example.com',
        recommendation: {
          careers: [
            {
              title: 'Software Engineer',
              matchPercentage: 95,
              description: 'Software engineering role...',
              requiredSkills: ['JavaScript', 'Python', 'React'],
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
        },
      };

      // Act
      const response = await request(app)
        .post('/api/assessment/email')
        .send(emailRequest)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid email request', async () => {
      // Arrange - invalid email format
      const invalidEmailRequest = {
        email: 'not-an-email',
        recommendation: {
          careers: [
            {
              title: 'Software Engineer',
              matchPercentage: 95,
              description: 'Software engineering role...',
              requiredSkills: ['JavaScript', 'Python', 'React'],
              icon: 'code',
            },
          ],
          skillGaps: [],
          learningPaths: [],
        },
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/assessment/email')
        .send(invalidEmailRequest)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});