import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { nanoid } from "nanoid";
import { INDUSTRIES } from "@/lib/constants";
import { experienceSchema, ExperienceData } from "@shared/schema";
import { Experience } from "@/types/assessment";

interface ExperienceStepProps {
  data: ExperienceData;
  onChange: (data: ExperienceData) => void;
  onValidate: (isValid: boolean) => void;
}

export default function ExperienceStep({
  data,
  onChange,
  onValidate,
}: ExperienceStepProps) {
  const form = useForm<ExperienceData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      experiences: data.experiences || [],
      industries: data.industries || [],
    },
    mode: "onChange",
  });

  // Watch for changes and update parent component
  const watchedFields = form.watch();

  useEffect(() => {
    onChange(watchedFields);
  }, [watchedFields, onChange]);

  useEffect(() => {
    onValidate(form.formState.isValid);
  }, [form.formState.isValid, onValidate]);

  const addExperience = () => {
    const currentExperiences = form.getValues().experiences || [];
    const newExperience: Experience = {
      id: nanoid(),
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      currentPosition: false,
      responsibilities: "",
    };

    form.setValue("experiences", [...currentExperiences, newExperience], {
      shouldValidate: true,
    });
  };

  const removeExperience = (id: string) => {
    const currentExperiences = form.getValues().experiences || [];
    const updatedExperiences = currentExperiences.filter(
      (exp) => exp.id !== id,
    );
    form.setValue("experiences", updatedExperiences, { shouldValidate: true });
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: any,
  ) => {
    const currentExperiences = form.getValues().experiences || [];
    const updatedExperiences = currentExperiences.map((exp) => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });

    form.setValue("experiences", updatedExperiences, { shouldValidate: true });
  };

  const handleIndustryChange = (
    checked: boolean | "indeterminate",
    industryId: string,
  ) => {
    const currentIndustries = form.getValues().industries || [];
    let updatedIndustries: string[];

    if (checked) {
      updatedIndustries = [...currentIndustries, industryId];
    } else {
      updatedIndustries = currentIndustries.filter((id) => id !== industryId);
    }

    form.setValue("industries", updatedIndustries, { shouldValidate: true });
  };

  // Initialize with at least one experience if none exists
  // useEffect(() => {
  //   const experiences = form.getValues().experiences;
  //   if (!experiences || experiences.length === 0) {
  //     addExperience();
  //   }
  // }, [form]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-6">Work Experience</h2>
        <Button type="button" variant="outline" onClick={addExperience}>
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Experience
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <ScrollArea className="h-[400px] pr-4 rounded-md">
            {form.getValues().experiences?.map((experience, index) => (
              <div
                key={experience.id}
                className="bg-accent p-4 rounded-md space-y-4 mb-4"
              >
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">
                    Experience #{index + 1}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(experience.id)}
                    className="text-destructive h-8 px-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor={`job-title-${experience.id}`}
                      className="mb-1"
                    >
                      Job Title
                    </Label>
                    <Input
                      id={`job-title-${experience.id}`}
                      value={experience.jobTitle}
                      onChange={(e) =>
                        updateExperience(
                          experience.id,
                          "jobTitle",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`company-${experience.id}`}
                      className="mb-1"
                    >
                      Company Name
                    </Label>
                    <Input
                      id={`company-${experience.id}`}
                      value={experience.company}
                      onChange={(e) =>
                        updateExperience(
                          experience.id,
                          "company",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Acme Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor={`start-date-${experience.id}`}
                      className="mb-1"
                    >
                      Start Date
                    </Label>
                    <Input
                      id={`start-date-${experience.id}`}
                      type="month"
                      value={experience.startDate}
                      onChange={(e) =>
                        updateExperience(
                          experience.id,
                          "startDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`end-date-${experience.id}`}
                      className="mb-1"
                    >
                      End Date
                    </Label>
                    <Input
                      id={`end-date-${experience.id}`}
                      type="month"
                      value={experience.endDate}
                      onChange={(e) =>
                        updateExperience(
                          experience.id,
                          "endDate",
                          e.target.value,
                        )
                      }
                      disabled={experience.currentPosition}
                    />
                    <div className="mt-1 flex items-center">
                      <Checkbox
                        id={`current-position-${experience.id}`}
                        checked={experience.currentPosition}
                        onCheckedChange={(checked) => {
                          updateExperience(
                            experience.id,
                            "currentPosition",
                            checked === true,
                          );
                          if (checked === true) {
                            updateExperience(experience.id, "endDate", "");
                          }
                        }}
                      />
                      <Label
                        htmlFor={`current-position-${experience.id}`}
                        className="ml-2 text-sm"
                      >
                        I currently work here
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor={`responsibilities-${experience.id}`}
                    className="mb-1"
                  >
                    Responsibilities & Achievements
                  </Label>
                  <Textarea
                    id={`responsibilities-${experience.id}`}
                    value={experience.responsibilities}
                    onChange={(e) =>
                      updateExperience(
                        experience.id,
                        "responsibilities",
                        e.target.value,
                      )
                    }
                    placeholder="Describe your key responsibilities and notable achievements"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </ScrollArea>

          <Separator className="my-6" />

          <div>
            <Label className="text-base font-medium mb-3 block">
              Industry Experience
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {INDUSTRIES.map((industry) => (
                <div key={industry.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry.id}`}
                    checked={form.getValues().industries?.includes(industry.id)}
                    onCheckedChange={(checked) =>
                      handleIndustryChange(checked, industry.id)
                    }
                  />
                  <Label htmlFor={`industry-${industry.id}`}>
                    {industry.name}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.industries && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.industries.message}
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
