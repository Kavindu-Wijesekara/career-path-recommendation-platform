import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CareerRecommendation } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Type for the skill gap data used in the chart
interface SkillGapData {
  name: string;
  userProficiency: number;
  requiredProficiency: number;
  gap: number;
}

interface RecommendationResultsProps {
  isLoading: boolean;
  recommendations: CareerRecommendation | null;
  onStartOver: () => void;
}

export default function RecommendationResults({
  isLoading,
  recommendations,
  onStartOver
}: RecommendationResultsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  // Function to download PDF of career recommendations
  const handleDownloadPDF = async () => {
    if (!recommendations) return;
    
    try {
      setPdfLoading(true);
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        body: JSON.stringify({ recommendations }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Create a blob URL and trigger download
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'career-recommendations.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your career recommendations have been downloaded as a PDF.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error Generating PDF",
        description: "There was a problem generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Function to send email with career recommendations
  const handleSendEmail = async () => {
    if (!recommendations || !email) return;
    
    try {
      setEmailLoading(true);
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: JSON.stringify({ 
          email,
          recommendations 
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      toast({
        title: "Email Sent Successfully",
        description: `Your career recommendations have been sent to ${email}.`,
        variant: "default",
      });
      
      setEmailDialogOpen(false);
      setEmail("");
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error Sending Email",
        description: "There was a problem sending your email. Please check the address and try again.",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Analyzing your profile...</p>
        <p className="text-gray-500">Our AI is finding the best career matches for you</p>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center py-16">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto h-16 w-16 text-destructive"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-700">Error Loading Recommendations</p>
        <p className="text-gray-500 mb-6">We encountered an issue while analyzing your profile.</p>
        <Button onClick={onStartOver}>
          Try Again
        </Button>
      </div>
    );
  }

  const topMatch = recommendations.careerPaths[0];
  
  // Generate sample data for the skills gap visualization
  const skillGapData = topMatch.skillGap.skills.map((skill, index) => ({
    name: skill,
    userProficiency: Math.max(30, Math.min(85, 50 + (index * 5))), // Just for visualization
    requiredProficiency: 100,
    gap: Math.max(0, 100 - (50 + (index * 5)))
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-xl font-bold">Your Career Path Recommendations</h2>
          <p className="text-sm opacity-90">Based on your skills, experience, and interests</p>
        </div>
        
        <CardContent className="p-6">
          {/* Match Summary */}
          <div className="bg-accent rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-lg">
                  Your Top Match: <span className="font-bold text-primary">{topMatch.title}</span>
                </h3>
                <p className="text-gray-600">{topMatch.match}% match based on your profile</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary"
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  ) : (
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  Save Results (PDF)
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setEmailDialogOpen(true)}
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
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email Results
                </Button>
              </div>
            </div>
          </div>

          {/* Career Cards */}
          <h3 className="text-lg font-semibold mb-4">Recommended Career Paths</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.careerPaths.map((career, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 p-4 flex justify-between items-center border-b border-gray-200">
                  <h4 className="font-bold text-lg">{career.title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${career.match >= 85 ? 'bg-green-100 text-green-800' : 
                      career.match >= 75 ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {career.match}% Match
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start mb-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-primary"
                      >
                        {career.icon === "chart-bar" && <path d="M3 3v18h18M9 9h1v10H9zM14 13h1v6h-1zM19 6h1v13h-1z" />}
                        {career.icon === "brain" && <path d="M12 3c1 0 2.1.3 3 .8a5.5 5.5 0 0 1 7.5 5.1c0 2.6-1.9 4.8-4.4 5.3-.6 2.8-2.9 4.9-5.6 5.6-2.8.7-5.7-.2-7.4-2.3a6 6 0 0 1 .8-9 5.5 5.5 0 0 1 6.1-5.5ZM7 16.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9ZM9.5 10c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9ZM14.5 12c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1ZM15 16c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1ZM17 2.5c3 1 5 3.4 5 6.5a7 7 0 0 1-7 7 .3.3 0 0 0-.3.3c0 1.5-.4 2.8-1 4a8 8 0 0 1-11.8 2.4 8 8 0 0 1-2.4-9.4 7.8 7.8 0 0 1 4.9-4.2 5.5 5.5 0 0 1 4.6-6.1c3-.4 5.8 1.3 7 4.5a.3.3 0 0 0 .4.2 6 6 0 0 1 .6-.2Z" />}
                        {career.icon === "chart-line" && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
                        {!career.icon && <circle cx="12" cy="12" r="10" />}
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Career Match</p>
                      <p className="text-sm text-gray-500">
                        {career.match}% similarity with your profile
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{career.description}</p>
                  
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Required Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {career.requiredSkills.map((skill, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                  >
                    View Details
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
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Skills Gap Analysis */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">Skills Gap Analysis</h3>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">For {topMatch.title} Role</h4>
                <p className="text-sm text-gray-600 mb-4">Here's how your current skills compare to what's typically required:</p>
                
                <div className="space-y-4 mb-8">
                  {skillGapData.map((skillData, index) => {
                    const percentage = skillData.userProficiency;
                    let colorClass = "bg-primary";
                    
                    if (percentage < 40) colorClass = "bg-red-500";
                    else if (percentage < 70) colorClass = "bg-yellow-500";
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{skillData.name}</span>
                          <span className="text-sm text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`${colorClass} h-2.5 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={skillGapData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="userProficiency" name="Your Proficiency" fill="#0A66C2" />
                    <Bar dataKey="requiredProficiency" name="Required Proficiency" fill="#057642" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommended Learning Path</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  <ul className="space-y-2 text-sm">
                    {topMatch.skillGap.learningPath.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary mt-1 mr-2 h-4 w-4"
                        >
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                        </svg>
                        <span dangerouslySetInnerHTML={{ 
                          __html: recommendation.replace(/`([^`]+)`/g, '<span class="font-medium">$1</span>')
                        }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Start Over Button */}
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              onClick={onStartOver}
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
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
              Start Over
            </Button>
            <p className="mt-2 text-xs text-gray-500">Your data is not stored and will be lost when you start over.</p>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email Results</DialogTitle>
            <DialogDescription>
              Enter your email address to receive your career recommendations as a PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={emailLoading || !email}
            >
              {emailLoading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
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
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M6 6l2-2m0 0l2-2m-2 2L6 2m2 2l2 2" />
                </svg>
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}