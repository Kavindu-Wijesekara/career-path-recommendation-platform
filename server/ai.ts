import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AssessmentData,
  CareerRecommendation,
  careerRecommendationSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateCareerRecommendations(
  assessmentData: AssessmentData,
): Promise<CareerRecommendation> {
  try {
    // System instruction to guide the model's behavior
    const systemInstruction = `
      You are a career advisor. Analyze the user's education, skills, experience, and interests from the provided assessment data to suggest 3 personalized career paths with integrated skill gap analysis. Adapt your recommendations based on the completeness of the user's profile.

Decision Logic:
- Scenario 1 (Basic Profile): If user only has education and skills data (no experience or career goals), base recommendations primarily on their education level, field of study, and existing skills.
- Scenario 2 (Education + Goals): If user has education, skills, and career goals (but no substantial experience), prioritize career goals while ensuring recommendations align with education and skills.
- Scenario 3 (Complete Profile): If user has education, skills, experience, career goals, and interests, focus primarily on career goals and interests. Avoid recommending jobs similar to their current position.

Career Paths with Integrated Skill Gap Analysis:
- Suggest exactly 3 career paths, ordered by match percentage (highest first, 65-95%).
- For each career path, include:
  - "title": The career name.
  - "match": Percentage (65-95%) reflecting alignment with profile.
  - "description": Brief description of the role (under 20 words).
  - "requiredSkills": Exactly 4 skills needed for the role.
  - "icon": A FontAwesome icon (e.g., "fa-robot" for AI roles).
  - "skillGap": An object containing:
    - "skills": Array of exactly 5 skill names that are important for success in this career path.
    - "learningPath": Array of exactly 4 detailed learning recommendations that are specific, actionable, and tailored to the user's background.

Output Format:
Return a valid JSON object in this structure:
{
  "careerPaths": [
    {
      "title": "Career title", 
      "match": 95, 
      "description": "Brief description", 
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"], 
      "icon": "FontAwesome icon",
      "skillGap": {
        "skills": ["Skill name 1", "Skill name 2", "Skill name 3", "Skill name 4", "Skill name 5"],
        "learningPath": [
          "Detailed recommendation about specific technology or skill with explanation of its value in this career path",
          "Recommendation about certification or course with explanation of how it builds necessary expertise",
          "Suggestion for practical project to develop hands-on experience with important concept",
          "Recommendation for advanced skill that would provide competitive advantage in this field"
        ]
      }
    },
    {
      "title": "Career title 2", 
      "match": 85, 
      "description": "Brief description", 
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"], 
      "icon": "FontAwesome icon",
      "skillGap": {
        "skills": ["Skill name 1", "Skill name 2", "Skill name 3", "Skill name 4", "Skill name 5"],
        "learningPath": [
          "Detailed recommendation 1 for career 2",
          "Detailed recommendation 2 for career 2",
          "Detailed recommendation 3 for career 2",
          "Detailed recommendation 4 for career 2"
        ]
      }
    },
    {
      "title": "Career title 3", 
      "match": 75, 
      "description": "Brief description", 
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"], 
      "icon": "FontAwesome icon",
      "skillGap": {
        "skills": ["Skill name 1", "Skill name 2", "Skill name 3", "Skill name 4", "Skill name 5"],
        "learningPath": [
          "Detailed recommendation 1 for career 3",
          "Detailed recommendation 2 for career 3",
          "Detailed recommendation 3 for career 3",
          "Detailed recommendation 4 for career 3"
        ]
      }
    }
  ]
}

Guidelines for Learning Recommendations:
- Each learning recommendation should be 25-50 words in length to provide sufficient detail
- Include what to learn and why it's valuable for the career
- Mention specific technologies, concepts, or methodologies
- Suggest potential learning resources or approaches (certifications, courses, projects)
- For each career, include a mix of technical skills, industry knowledge, and soft skills
- Tailor learning paths to the user's current background – more foundational for beginners, more advanced for experienced professionals

Additional Guidelines:
- Ensure all three recommended career paths are distinct and relevant to the user's profile.
- For users with career goals, ensure at least one recommendation directly aligns with that goal.
- If the user has professional experience, avoid recommending their current profession unless specifically aligned with their stated career goals.
- Make learning recommendations highly specific, mentioning actual technologies, certifications, or methodologies rather than general advice.
- Maintain consistent output format to ensure frontend compatibility.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
    });

    const prompt = `
    I need personalized career path recommendations based on the following assessment data.
    Assessment data:
    ${JSON.stringify(assessmentData, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      throw new Error("No content received from Gemini");
    }

    // Extract JSON from the response (in case there's additional text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate the response against our schema
    const validatedResponse = careerRecommendationSchema.parse(parsedResponse);

    return validatedResponse;
  } catch (error) {
    console.error("Error generating career recommendations:", error);

    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      throw new Error(`Invalid AI response format: ${validationError.message}`);
    }

    throw new Error(
      "Failed to generate career recommendations. Please try again later.",
    );
  }
}
