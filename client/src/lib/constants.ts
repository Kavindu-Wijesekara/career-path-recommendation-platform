import { Industry, TechSkill, SoftSkill, InterestArea, StepInfo } from "@/types/assessment";

export const EDUCATION_LEVELS = [
  { value: "high-school", label: "High School Diploma" },
  { value: "associate", label: "Associate's Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "Ph.D. or Doctorate" },
  { value: "certification", label: "Professional Certification" },
];

export const TECHNICAL_SKILLS: TechSkill[] = [
  { id: "programming", name: "Programming" },
  { id: "data-analysis", name: "Data Analysis" },
  { id: "digital-marketing", name: "Digital Marketing" },
  { id: "graphic-design", name: "Graphic Design" },
  { id: "web-development", name: "Web Development" },
  { id: "project-management", name: "Project Management" },
  { id: "ui-ux-design", name: "UI/UX Design" },
  { id: "cloud-computing", name: "Cloud Computing" },
  { id: "cybersecurity", name: "Cybersecurity" },
  { id: "database-management", name: "Database Management" },
  { id: "machine-learning", name: "Machine Learning" },
  { id: "mobile-development", name: "Mobile Development" },
];

export const SOFT_SKILLS: SoftSkill[] = [
  { id: "leadership", name: "Leadership" },
  { id: "communication", name: "Communication" },
  { id: "teamwork", name: "Teamwork" },
  { id: "problem-solving", name: "Problem Solving" },
  { id: "adaptability", name: "Adaptability" },
  { id: "time-management", name: "Time Management" },
  { id: "critical-thinking", name: "Critical Thinking" },
  { id: "creativity", name: "Creativity" },
  { id: "emotional-intelligence", name: "Emotional Intelligence" },
  { id: "negotiation", name: "Negotiation" },
];

export const INDUSTRIES: Industry[] = [
  { id: "tech", name: "Technology" },
  { id: "healthcare", name: "Healthcare" },
  { id: "finance", name: "Finance" },
  { id: "education", name: "Education" },
  { id: "retail", name: "Retail" },
  { id: "manufacturing", name: "Manufacturing" },
  { id: "media", name: "Media & Entertainment" },
  { id: "hospitality", name: "Hospitality & Tourism" },
  { id: "construction", name: "Construction" },
  { id: "energy", name: "Energy" },
  { id: "government", name: "Government" },
  { id: "nonprofit", name: "Nonprofit" },
];

export const INTEREST_AREAS: InterestArea[] = [
  { id: "technology", name: "Technology", icon: "laptop-code" },
  { id: "healthcare", name: "Healthcare", icon: "heartbeat" },
  { id: "business", name: "Business", icon: "chart-line" },
  { id: "education", name: "Education", icon: "graduation-cap" },
  { id: "arts", name: "Arts & Design", icon: "palette" },
  { id: "environment", name: "Environment", icon: "leaf" },
  { id: "social-impact", name: "Social Impact", icon: "hands-helping" },
  { id: "science", name: "Science & Research", icon: "flask" },
  { id: "legal", name: "Legal", icon: "balance-scale" },
  { id: "construction", name: "Construction & Engineering", icon: "hard-hat" },
];

export const STEPS: StepInfo[] = [
  { id: "education", title: "Education", icon: "user-graduate" },
  { id: "skills", title: "Skills", icon: "cogs" },
  { id: "experience", title: "Experience", icon: "briefcase" },
  { id: "interests", title: "Interests", icon: "heart" },
];

export const PROFICIENCY_LABELS = ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"];
