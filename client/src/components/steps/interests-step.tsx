import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { INTEREST_AREAS } from "@/lib/constants";
import { interestSchema, InterestData } from "@shared/schema";

interface InterestsStepProps {
  data: InterestData;
  onChange: (data: InterestData) => void;
  onValidate: (isValid: boolean) => void;
}

export default function InterestsStep({ data, onChange, onValidate }: InterestsStepProps) {
  const form = useForm<InterestData>({
    resolver: zodResolver(interestSchema),
    defaultValues: data,
    mode: "onChange"
  });

  // Watch for changes and update parent component
  const watchedFields = form.watch();
  
  useEffect(() => {
    onChange(watchedFields);
  }, [watchedFields, onChange]);

  useEffect(() => {
    onValidate(form.formState.isValid);
  }, [form.formState.isValid, onValidate]);

  const handleInterestChange = (checked: boolean | "indeterminate", areaId: string) => {
    const currentAreas = form.getValues().interestAreas || [];
    let updatedAreas: string[];
    
    if (checked) {
      updatedAreas = [...currentAreas, areaId];
    } else {
      updatedAreas = currentAreas.filter(id => id !== areaId);
    }
    
    form.setValue("interestAreas", updatedAreas, { shouldValidate: true });
  };

  const handleSliderChange = (field: "remotePreference" | "teamSizePreference", value: number[]) => {
    form.setValue(`workPreferences.${field}`, value[0], { shouldValidate: true });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Career Interests</h2>
      
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="careerGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Career Goals</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What are your career aspirations? What type of work environment do you thrive in?"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label className="text-base font-medium mb-3 block">Areas of Interest</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTEREST_AREAS.map((area) => {
                const isSelected = form.getValues().interestAreas?.includes(area.id);
                return (
                  <div key={area.id}>
                    <input
                      type="checkbox"
                      id={`interest-${area.id}`}
                      checked={isSelected}
                      onChange={(e) => handleInterestChange(e.target.checked, area.id)}
                      className="sr-only peer" 
                    />
                    <label 
                      htmlFor={`interest-${area.id}`} 
                      className={`flex p-5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 
                        ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="w-full text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`mx-auto mb-2 h-6 w-6 ${isSelected ? 'text-primary' : 'text-gray-500'}`}
                        >
                          {area.id === "technology" && <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />}
                          {area.id === "healthcare" && <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />}
                          {area.id === "business" && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
                          {area.id === "education" && <path d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />}
                          {area.id === "arts" && <g><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></g>}
                          {area.id === "environment" && <path d="M2 22 16 8M10.47 13.76 6.25 9.54M13.76 10.47 9.54 6.25M16 8 8 16" />}
                          {area.id === "social-impact" && <path d="M14 11a4 4 0 0 0 0-8 4 4 0 0 0-8 0v8h8zM4 15h16M22 15v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4" />}
                          {area.id === "science" && <path d="M9 2h6M12 2v7M8.85 14.13l-2.36 7.08a2 2 0 0 0 1.8 2.79h7.42a2 2 0 0 0 1.8-2.79l-2.36-7.08a5.72 5.72 0 0 0-6.3 0Z" />}
                          {area.id === "legal" && <path d="m2 4 3 12h14l3-12-10 6-10-6zm19 16v2H3v-2zM12 6v7" />}
                          {area.id === "construction" && <g><rect x="5" y="8" width="14" height="12" rx="2" ry="2" /><path d="M19 8a7 7 0 0 0-14 0" /><path d="M12 4V2" /></g>}
                        </svg>
                        <h3 className="font-medium">{area.name}</h3>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
            {form.formState.errors.interestAreas && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.interestAreas.message}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Work Environment Preferences</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center">
                  <Label className="w-40 text-sm">Remote vs. In-office</Label>
                  <div className="flex-grow max-w-md">
                    <Slider
                      defaultValue={[form.getValues().workPreferences?.remotePreference || 3]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => handleSliderChange("remotePreference", value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 max-w-md ml-40 mt-1">
                  <span>Fully Remote</span>
                  <span>Hybrid</span>
                  <span>In-office</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center">
                  <Label className="w-40 text-sm">Team Size</Label>
                  <div className="flex-grow max-w-md">
                    <Slider
                      defaultValue={[form.getValues().workPreferences?.teamSizePreference || 3]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => handleSliderChange("teamSizePreference", value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 max-w-md ml-40 mt-1">
                  <span>Small Team</span>
                  <span>Mid-size</span>
                  <span>Large Org</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}