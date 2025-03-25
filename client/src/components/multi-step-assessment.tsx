import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { STEPS } from "@/lib/constants";
import { 
  AssessmentData, 
  EducationData, 
  SkillData, 
  ExperienceData, 
  InterestData,
  Step
} from "@/types/assessment";
import EducationStep from "./steps/education-step";
import SkillsStep from "./steps/skills-step";
import ExperienceStep from "./steps/experience-step";
import InterestsStep from "./steps/interests-step";

interface MultiStepAssessmentProps {
  onComplete: (data: AssessmentData) => void;
}

export default function MultiStepAssessment({ onComplete }: MultiStepAssessmentProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("education");
  const [formData, setFormData] = useState<Partial<AssessmentData>>({
    education: {
      level: "",
      fieldOfStudy: "",
      achievements: ""
    },
    skills: {
      technicalSkills: [],
      softSkills: [],
      skillProficiencies: []
    },
    experience: {
      experiences: [],
      industries: []
    },
    interests: {
      careerGoals: "",
      interestAreas: [],
      workPreferences: {
        remotePreference: 3,
        teamSizePreference: 3
      }
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValid, setStepValid] = useState({
    education: false,
    skills: false,
    experience: false,
    interests: false
  });

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  
  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    // Check if all required data is present
    if (!stepValid.education || !stepValid.skills || !stepValid.experience || !stepValid.interests) {
      toast({
        title: "Incomplete information",
        description: "Please complete all required fields in each step",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // We have all the form data, submit to parent component
      onComplete(formData as AssessmentData);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Error",
        description: "An error occurred while submitting your assessment. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const updateFormData = (step: Step, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const updateStepValidity = (step: Step, isValid: boolean) => {
    setStepValid(prev => ({
      ...prev,
      [step]: isValid
    }));
  };

  return (
    <Card className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
      {/* Progress Stepper */}
      <div className="bg-accent px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <ol className="flex items-center w-full">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
              const activeClass = isActive || isCompleted ? "text-primary after:border-primary" : "text-gray-500 after:border-gray-200";
              const iconBgClass = isActive || isCompleted ? "bg-primary" : "bg-gray-200";
              const iconTextClass = isActive || isCompleted ? "text-white" : "text-gray-500";
              
              return (
                <li 
                  key={step.id}
                  className={`flex ${index < STEPS.length - 1 ? 'w-full' : ''} items-center ${activeClass} after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 ${iconBgClass} rounded-full lg:h-12 lg:w-12 shrink-0`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`w-5 h-5 ${iconTextClass}`}
                    >
                      {step.id === "education" && <path d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />}
                      {step.id === "skills" && <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />}
                      {step.id === "experience" && <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />}
                      {step.id === "interests" && <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />}
                    </svg>
                  </div>
                  <span className="ml-2 text-sm font-medium truncate hidden sm:inline">{step.title}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Form Steps Container */}
      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Education Step */}
          {currentStep === "education" && (
            <EducationStep 
              data={formData.education as EducationData}
              onChange={(data) => updateFormData("education", data)}
              onValidate={(isValid) => updateStepValidity("education", isValid)}
            />
          )}

          {/* Skills Step */}
          {currentStep === "skills" && (
            <SkillsStep 
              data={formData.skills as SkillData}
              onChange={(data) => updateFormData("skills", data)}
              onValidate={(isValid) => updateStepValidity("skills", isValid)}
            />
          )}

          {/* Experience Step */}
          {currentStep === "experience" && (
            <ExperienceStep 
              data={formData.experience as ExperienceData}
              onChange={(data) => updateFormData("experience", data)}
              onValidate={(isValid) => updateStepValidity("experience", isValid)}
            />
          )}

          {/* Interests Step */}
          {currentStep === "interests" && (
            <InterestsStep 
              data={formData.interests as InterestData}
              onChange={(data) => updateFormData("interests", data)}
              onValidate={(isValid) => updateStepValidity("interests", isValid)}
            />
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous
            </Button>
            
            <Button
              variant="default"
              onClick={handleNextStep}
              disabled={isSubmitting || !stepValid[currentStep]}
            >
              {currentStepIndex === STEPS.length - 1 ? (
                <>
                  Get Recommendations
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 h-4 w-4"
                  >
                    <path d="M12 2a9.96 9.96 0 0 0-7.071 2.929A9.96 9.96 0 0 0 2 12a9.96 9.96 0 0 0 2.929 7.071A9.96 9.96 0 0 0 12 22a9.96 9.96 0 0 0 7.071-2.929A9.96 9.96 0 0 0 22 12a9.96 9.96 0 0 0-2.929-7.071A9.96 9.96 0 0 0 12 2Z" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </>
              ) : (
                <>
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 h-4 w-4"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}