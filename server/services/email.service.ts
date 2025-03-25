import { Resend } from "resend";
import { CareerRecommendation } from "@shared/schema";
import { BaseService } from "./base.service";

/**
 * Service for sending emails using Resends
 */
export class EmailService extends BaseService {
  private resend: Resend;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Validate API key exists
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not found. Email service will not function properly.");
    } else {
      this.isInitialized = true;
    }
  }

  /**
   * Sends career recommendations via email
   * @param email Recipient email address
   * @param recommendation Career recommendation data
   * @param pdfBuffer PDF attachment as Buffer
   * @returns Result of email send operation
   */
  async sendResultsEmail(
    email: string, 
    recommendation: CareerRecommendation,
    pdfBuffer: Buffer
  ): Promise<any> {
    if (!this.isInitialized) {
      throw new Error("Email service not initialized properly");
    }

    try {
      const topMatch = recommendation.careerPaths[0];
      
      const response = await this.resend.emails.send({
        from: 'Career Advisor <no-reply@test.com>',
        to: email,
        subject: 'Your Career Path Assessment Results',
        html: this.generateEmailHTML(recommendation),
        attachments: [
          {
            filename: 'career-assessment-results.pdf',
            content: pdfBuffer,
          },
        ],
      });

      return response;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  /**
   * Generates HTML content for the email
   * @param recommendation Career recommendation data
   * @returns HTML string
   */
  private generateEmailHTML(recommendation: CareerRecommendation): string {
    const topMatch = recommendation.careerPaths[0];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Career Path Assessment Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #0A66C2;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
            margin-bottom: 20px;
          }
          .top-match {
            background-color: #f7f9fc;
            border-left: 4px solid #0A66C2;
            padding: 15px;
            margin-bottom: 20px;
          }
          .match-score {
            display: inline-block;
            background-color: #0A66C2;
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 14px;
            margin-left: 10px;
          }
          .skills {
            margin-bottom: 15px;
          }
          .skill-tag {
            display: inline-block;
            background-color: #e1ecf4;
            color: #0A66C2;
            padding: 3px 8px;
            border-radius: 3px;
            margin-right: 5px;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #0A66C2;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your Career Path Assessment</h1>
          <p>Below is a summary of your personalized career recommendations</p>
        </div>
        
        <p>Thank you for completing the career path assessment. Based on your profile, we've identified the following career paths that align with your skills, experience, and interests.</p>
        
        <div class="top-match">
          <h2>Your Top Match: ${topMatch.title} <span class="match-score">${topMatch.match}% Match</span></h2>
          <p>${topMatch.description}</p>
          
          <div class="skills">
            <h3>Key Required Skills:</h3>
            ${topMatch.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join(' ')}
          </div>
        </div>
        
        <p>We've also identified <strong>two additional career paths</strong> that match your profile:</p>
        <ul>
          ${recommendation.careerPaths.slice(1).map(career => 
            `<li><strong>${career.title}</strong> (${career.match}% Match)</li>`
          ).join('')}
        </ul>
        
        <p>For a complete analysis including skill gap assessment and personalized learning paths for each career option, please check the attached PDF document.</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="#" class="button">View Full Results Online</a>
        </p>
        
        <p>We hope this assessment helps guide your career decisions. If you have any questions or need further assistance, please don't hesitate to contact us.</p>
        
        <div class="footer">
          <p>This email was sent as a result of your request on the Career Path Finder application.</p>
          <p>© ${new Date().getFullYear()} Career Path Finder. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}