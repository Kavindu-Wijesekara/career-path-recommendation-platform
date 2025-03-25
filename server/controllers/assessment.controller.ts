import { Request, Response } from "express";
import { AssessmentData, assessmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { ServiceContainer } from "../services/service-container";
import { StorageService } from "../services/storage.service";
import { PDFService } from "../services/pdf.service";
import { EmailService } from "../services/email.service";

/**
 * Controller for assessment-related routes
 */
export class AssessmentController {
  private storageService: StorageService;
  private pdfService: PDFService;
  private emailService: EmailService;

  constructor() {
    const serviceContainer = ServiceContainer.getInstance();
    this.storageService = serviceContainer.get<StorageService>("storage");
    this.pdfService = serviceContainer.getPDFService();
    this.emailService = serviceContainer.getEmailService();
  }

  /**
   * Process assessment data and return career recommendations
   * @param req Express request
   * @param res Express response
   */
  public async processAssessment(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const assessmentData = assessmentSchema.parse(req.body);
      
      // Process the assessment data
      const recommendations = await this.storageService.processAssessment(assessmentData);
      
      // Return recommendations
      res.json(recommendations);
    } catch (error) {
      console.error("Error processing career recommendations:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          error: "Validation error", 
          details: validationError.message 
        });
      } else {
        res.status(500).json({ 
          error: "Failed to process assessment", 
          message: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
  }

  /**
   * Generate and return a PDF of career recommendations
   * @param req Express request
   * @param res Express response
   */
  public async generatePDF(req: Request, res: Response): Promise<void> {
    try {
      // Extract recommendation data from request body
      const { recommendations } = req.body;
      
      if (!recommendations || !recommendations.careerPaths || !Array.isArray(recommendations.careerPaths)) {
        res.status(400).json({ error: "Invalid recommendation data" });
        return;
      }
      
      // Generate PDF
      const pdfBuffer = await this.pdfService.generatePDF(recommendations);
      
      // Set content type and attachment header
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=career-recommendations.pdf");
      
      // Send the PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Send career recommendations via email
   * @param req Express request
   * @param res Express response
   */
  public async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      // Extract email and recommendation data from request body
      const { email, recommendations } = req.body;
      
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }
      
      if (!recommendations || !recommendations.careerPaths || !Array.isArray(recommendations.careerPaths)) {
        res.status(400).json({ error: "Invalid recommendation data" });
        return;
      }
      
      // Generate PDF for email attachment
      const pdfBuffer = await this.pdfService.generatePDF(recommendations);
      
      // Send email with PDF attachment
      const result = await this.emailService.sendResultsEmail(email, recommendations, pdfBuffer);
      
      res.json({
        message: "Email sent successfully",
        result
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}