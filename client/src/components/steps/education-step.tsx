import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { educationSchema, EducationData } from "@shared/schema";

interface EducationStepProps {
  data: EducationData;
  onChange: (data: EducationData) => void;
  onValidate: (isValid: boolean) => void;
}

export default function EducationStep({ data, onChange, onValidate }: EducationStepProps) {
  const form = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Education Background</h2>
      
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Highest Education Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Computer Science, Business, Psychology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="achievements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Achievements</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List notable achievements, GPA, honors, etc."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert className="bg-blue-50 border-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <AlertTitle className="text-primary">Need help?</AlertTitle>
            <AlertDescription className="text-blue-700">
              Include all relevant education, even if it's not directly related to your target career. AI can find unexpected connections!
            </AlertDescription>
          </Alert>
        </form>
      </Form>
    </div>
  );
}
