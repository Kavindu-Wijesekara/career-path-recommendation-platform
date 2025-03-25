import { CareerRecommendation } from "@shared/schema";
import { BaseService } from "./base.service";
import * as pdf from "html-pdf";
import { parse } from "node-html-parser";

/**
 * Service for generating PDF files from assessment results
 */
export class PDFService extends BaseService {
  /**
   * Generates a PDF from career recommendations
   * @param recommendation Career recommendation data
   * @returns Buffer containing PDF data
   */
  async generatePDF(recommendation: CareerRecommendation): Promise<Buffer> {
    try {
      const html = this.generateHTML(recommendation);
      return await this.convertHTMLToPDF(html);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  /**
   * Converts HTML content to PDF
   * @param html HTML content
   * @returns Promise resolving to PDF buffer
   */
  private async convertHTMLToPDF(html: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const options = {
        format: "Letter" as const,
        border: {
          top: "1cm",
          right: "1cm",
          bottom: "1cm",
          left: "1cm"
        },
        footer: {
          height: "28mm",
          contents: {
            default: 
              '<div style="text-align: center; font-size: 12px; color: #777;">' +
              '<p>Career Path Assessment Results | Generated on ' + 
              new Date().toLocaleDateString() + 
              '</p></div>'
          }
        }
      };

      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  }

  /**
   * Generates HTML content for the PDF from recommendation data
   * @param recommendation Career recommendation data
   * @returns HTML string
   */
  private generateHTML(recommendation: CareerRecommendation): string {
    const topMatch = recommendation.careerPaths[0];
    
    // Create HTML template for the PDF
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Career Path Assessment Results</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          h1 {
            color: #0A66C2;
            border-bottom: 2px solid #0A66C2;
            padding-bottom: 10px;
          }
          h2 {
            color: #057642;
            margin-top: 30px;
          }
          h3 {
            color: #444;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .date {
            color: #666;
            font-style: italic;
          }
          .career-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
          }
          .match-percentage {
            font-weight: bold;
            color: #0A66C2;
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
          .skill-gap {
            background-color: #f0f7ff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .learning-item {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
          }
          .learning-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #0A66C2;
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Career Path Assessment Results</h1>
            <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h2>Your Top Career Matches</h2>
          <p>Based on your skills, experience, education, and interests, here are your most suitable career paths:</p>
          
          ${recommendation.careerPaths.map((career, index) => `
            <div class="career-card">
              <h3>${career.title} <span class="match-percentage">(${career.match}% Match)</span></h3>
              <p>${career.description}</p>
              
              <h4>Required Skills:</h4>
              <div>
                ${career.requiredSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
              
              <div class="skill-gap">
                <h4>Skills to Develop:</h4>
                <div>
                  ${career.skillGap.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                
                <h4>Learning Path:</h4>
                ${career.skillGap.learningPath.map(recommendation => `
                  <div class="learning-item">${recommendation}</div>
                `).join('')}
              </div>
            </div>
            ${index < recommendation.careerPaths.length - 1 ? '<div class="page-break"></div>' : ''}
          `).join('')}
          
          <div class="page-break"></div>
          
          <h2>Next Steps</h2>
          <p>Here are some recommended actions to help you prepare for your target careers:</p>
          <ol>
            <li>Focus on developing the identified skill gaps for your top career match.</li>
            <li>Research specific certifications and courses that will enhance your qualifications.</li>
            <li>Update your resume to highlight relevant skills and experience.</li>
            <li>Connect with professionals in your target field for mentorship opportunities.</li>
            <li>Consider applying for entry-level or transitional roles that will help you build experience.</li>
          </ol>
          
          <p style="margin-top: 40px; text-align: center; color: #666;">
            This assessment is provided for guidance purposes only and should be used alongside other career planning resources.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}