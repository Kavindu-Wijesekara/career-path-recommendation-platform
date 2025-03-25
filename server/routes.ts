import type { Express } from "express";
import { createServer, type Server } from "http";
import { ServiceContainer } from "./services/service-container";
import { StorageService } from "./services/storage.service";
import { AssessmentController } from "./controllers/assessment.controller";
import { RateLimitMiddleware } from "./middlewares/rate-limit.middleware";

/**
 * Register all routes for the application
 * @param app Express application
 * @returns HTTP Server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the service container
  const serviceContainer = ServiceContainer.getInstance();
  await serviceContainer.initialize();
  
  // Register storage service
  serviceContainer.register("storage", new StorageService());
  await serviceContainer.get<StorageService>("storage").initialize();
  
  // Create controller instance
  const assessmentController = new AssessmentController();
  
  // Apply general API rate limiter to all API routes
  app.use("/api", RateLimitMiddleware.createAPILimiter());
  
  // Route to process assessment data with stricter rate limiting
  app.post(
    "/api/career-recommendations",
    RateLimitMiddleware.createAssessmentLimiter(),
    (req, res) => assessmentController.processAssessment(req, res)
  );
  
  // Route to generate PDF
  app.post(
    "/api/generate-pdf",
    RateLimitMiddleware.createPDFLimiter(),
    (req, res) => assessmentController.generatePDF(req, res)
  );
  
  // Route to send email
  app.post(
    "/api/send-email",
    RateLimitMiddleware.createEmailLimiter(),
    (req, res) => assessmentController.sendEmail(req, res)
  );

  const httpServer = createServer(app);

  return httpServer;
}
