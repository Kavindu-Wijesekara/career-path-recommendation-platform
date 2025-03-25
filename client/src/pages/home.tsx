import { useState } from "react";
import Navbar from "@/components/navbar";
import IntroHeader from "@/components/intro-header";
import MultiStepAssessment from "@/components/multi-step-assessment";
import RecommendationResults from "@/components/recommendation-results";
import Footer from "@/components/footer";
import { AssessmentData, CareerRecommendation } from "@/types/assessment";

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation | null>(null);

  const handleAssessmentComplete = async (data: AssessmentData) => {
    setIsLoading(true);
    setShowResults(true);
    
    try {
      const response = await fetch("/api/career-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const recommendations = await response.json();
      setRecommendations(recommendations);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setShowResults(false);
    setRecommendations(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <IntroHeader 
          title="Discover Your Ideal Career Path"
          description="Our AI-powered assessment analyzes your skills, experience, and interests to recommend personalized career paths. Your data is never stored!"
        />
        
        {!showResults ? (
          <MultiStepAssessment onComplete={handleAssessmentComplete} />
        ) : (
          <RecommendationResults 
            isLoading={isLoading}
            recommendations={recommendations}
            onStartOver={handleStartOver} 
          />
        )}
        
        {/* Privacy Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-10">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary">Your privacy is our priority</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>All assessment data is processed locally and not stored on our servers. Your personal information remains private and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
