import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormMessage,
  FormField,
  FormItem,
  FormLabel,
  FormControl 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { TECHNICAL_SKILLS, SOFT_SKILLS, PROFICIENCY_LABELS } from "@/lib/constants";
import { skillSchema, SkillData } from "@shared/schema";

interface SkillsStepProps {
  data: SkillData;
  onChange: (data: SkillData) => void;
  onValidate: (isValid: boolean) => void;
}

export default function SkillsStep({ data, onChange, onValidate }: SkillsStepProps) {
  const form = useForm<SkillData>({
    resolver: zodResolver(skillSchema),
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

  const handleTechSkillChange = (checked: boolean | "indeterminate", skillId: string) => {
    const currentSkills = form.getValues().technicalSkills || [];
    let updatedSkills: string[];
    
    if (checked) {
      updatedSkills = [...currentSkills, skillId];
    } else {
      updatedSkills = currentSkills.filter(id => id !== skillId);
    }
    
    form.setValue("technicalSkills", updatedSkills, { shouldValidate: true });
  };

  const handleSoftSkillChange = (checked: boolean | "indeterminate", skillId: string) => {
    const currentSkills = form.getValues().softSkills || [];
    let updatedSkills: string[];
    
    if (checked) {
      updatedSkills = [...currentSkills, skillId];
    } else {
      updatedSkills = currentSkills.filter(id => id !== skillId);
    }
    
    form.setValue("softSkills", updatedSkills, { shouldValidate: true });
  };

  const handleProficiencyChange = (skillId: string, value: number[]) => {
    const proficiencies = form.getValues().skillProficiencies || [];
    const existingIndex = proficiencies.findIndex(p => p.skill === skillId);
    let updatedProficiencies = [...proficiencies];
    
    if (existingIndex >= 0) {
      updatedProficiencies[existingIndex] = { skill: skillId, proficiency: value[0] };
    } else {
      updatedProficiencies.push({ skill: skillId, proficiency: value[0] });
    }
    
    form.setValue("skillProficiencies", updatedProficiencies);
  };

  // State for custom skill dialog
  const [customSkillName, setCustomSkillName] = useState("");
  const [isCustomSkillDialogOpen, setIsCustomSkillDialogOpen] = useState(false);
  const [skillType, setSkillType] = useState<"technical" | "soft">("technical");
  
  const addCustomSkill = () => {
    if (!customSkillName.trim()) return;
    
    const customId = `custom-${Date.now()}-${customSkillName.toLowerCase().replace(/\s+/g, "-")}`;
    
    if (skillType === "technical") {
      const currentSkills = form.getValues().technicalSkills || [];
      form.setValue("technicalSkills", [...currentSkills, customId], { shouldValidate: true });
      
      // Add to TECHNICAL_SKILLS array (will be lost on refresh but works for this session)
      TECHNICAL_SKILLS.push({ id: customId, name: customSkillName });
    } else {
      const currentSkills = form.getValues().softSkills || [];
      form.setValue("softSkills", [...currentSkills, customId], { shouldValidate: true });
      
      // Add to SOFT_SKILLS array (will be lost on refresh but works for this session)
      SOFT_SKILLS.push({ id: customId, name: customSkillName });
    }
    
    setCustomSkillName("");
    setIsCustomSkillDialogOpen(false);
  };

  // Get top skills to rate proficiency
  const selectedTechSkills = form.getValues().technicalSkills || [];
  const topSkills = selectedTechSkills.slice(0, 3);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Skills Assessment</h2>
      
      <Form {...form}>
        <form className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Technical Skills</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TECHNICAL_SKILLS.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`skill-${skill.id}`}
                    checked={form.getValues().technicalSkills?.includes(skill.id)}
                    onCheckedChange={(checked) => handleTechSkillChange(checked, skill.id)}
                  />
                  <Label htmlFor={`skill-${skill.id}`}>{skill.name}</Label>
                </div>
              ))}
            </div>
            {form.formState.errors.technicalSkills && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.technicalSkills.message}
              </p>
            )}
            <Dialog open={isCustomSkillDialogOpen} onOpenChange={setIsCustomSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 text-primary hover:bg-primary/5"
                  onClick={() => {
                    setSkillType("technical");
                    setIsCustomSkillDialogOpen(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1 h-4 w-4"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add custom skill
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Custom Skill</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="custom-skill-name">Skill Name</Label>
                    <Input
                      id="custom-skill-name"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      placeholder="Enter your skill name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Skill Type</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <Checkbox
                          id="technical-skill-type"
                          checked={skillType === "technical"}
                          onCheckedChange={() => setSkillType("technical")}
                        />
                        <Label htmlFor="technical-skill-type" className="ml-2">
                          Technical Skill
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="soft-skill-type"
                          checked={skillType === "soft"}
                          onCheckedChange={() => setSkillType("soft")}
                        />
                        <Label htmlFor="soft-skill-type" className="ml-2">
                          Soft Skill
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={addCustomSkill}>
                    Add Skill
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Soft Skills</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {SOFT_SKILLS.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`soft-skill-${skill.id}`}
                    checked={form.getValues().softSkills?.includes(skill.id)}
                    onCheckedChange={(checked) => handleSoftSkillChange(checked, skill.id)}
                  />
                  <Label htmlFor={`soft-skill-${skill.id}`}>{skill.name}</Label>
                </div>
              ))}
            </div>
            {form.formState.errors.softSkills && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.softSkills.message}
              </p>
            )}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="mt-3 text-primary hover:bg-primary/5"
              onClick={() => {
                setSkillType("soft");
                setIsCustomSkillDialogOpen(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1 h-4 w-4"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add custom skill
            </Button>
          </div>

          {topSkills.length > 0 && (
            <div>
              <Label className="text-base font-medium mb-1 block">Skill Proficiency</Label>
              <p className="text-sm text-gray-500 mb-4">Rate your proficiency in your top 3 skills</p>

              <div className="space-y-6">
                {topSkills.map((skillId) => {
                  const skill = TECHNICAL_SKILLS.find(s => s.id === skillId);
                  const proficiency = form.getValues().skillProficiencies?.find(p => p.skill === skillId)?.proficiency || 3;
                  
                  return skill ? (
                    <div key={skill.id} className="space-y-2">
                      <div className="flex justify-between mb-1">
                        <Label className="text-sm font-medium">{skill.name}</Label>
                        <span className="text-sm text-gray-500">
                          {PROFICIENCY_LABELS[proficiency - 1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[proficiency]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={(value) => handleProficiencyChange(skill.id, value)}
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
