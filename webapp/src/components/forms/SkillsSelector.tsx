/**
 * Enhanced Skills Selector Component with Autocomplete
 * Allows adding/removing skills with suggestions based on existing data
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Plus, Tag, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useTechnicians } from '@/hooks/useTechnicians';

interface SkillsSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
  className?: string;
  disabled?: boolean;
}

// Common skills suggestions - could be fetched from API in real implementation
const COMMON_SKILLS = [
  'Hardware Troubleshooting',
  'Software Installation',
  'Network Configuration',
  'Windows Support',
  'MacOS Support',
  'Linux Support',
  'Mobile Device Setup',
  'Email Configuration',
  'Printer Setup',
  'Router Configuration',
  'Data Recovery',
  'Virus Removal',
  'System Optimization',
  'Remote Support',
  'Database Management',
  'Web Development',
  'Cloud Services',
  'Cybersecurity',
  'Server Maintenance',
  'Backup Solutions'
];

export function SkillsSelector({
  selectedSkills,
  onChange,
  placeholder = "Add skills...",
  maxSkills = 20,
  className = "",
  disabled = false
}: SkillsSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>(COMMON_SKILLS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch existing technicians to get skill suggestions
  const { data: techniciansData } = useTechnicians({ page: 0, size: 100 });

  // Extract unique skills from existing technicians
  useEffect(() => {
    if (techniciansData?.content) {
      const existingSkills = new Set<string>();
      techniciansData.content.forEach(technician => {
        technician.skills?.forEach(skill => existingSkills.add(skill));
      });
      
      // Combine common skills with existing skills from database
      const allSkills = Array.from(new Set([...COMMON_SKILLS, ...Array.from(existingSkills)]));
      setAvailableSkills(allSkills);
    }
  }, [techniciansData]);

  // Filter suggestions based on input and exclude already selected skills
  const filteredSuggestions = availableSkills.filter(skill =>
    skill.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !selectedSkills.includes(trimmedSkill) &&
      selectedSkills.length < maxSkills
    ) {
      onChange([...selectedSkills, trimmedSkill]);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      // Remove last skill when backspace is pressed on empty input
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(value.length > 0);
  };

  const canAddMoreSkills = selectedSkills.length < maxSkills;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-2 py-1">
              <Tag className="h-3 w-3 mr-1" />
              {skill}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Skills Input - Simplified Version */}
      {!disabled && canAddMoreSkills && (
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pr-10"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2"
            onClick={() => inputValue.trim() && addSkill(inputValue.trim())}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Skill Suggestions - Simple List */}
      {!disabled && canAddMoreSkills && inputValue && filteredSuggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1">
          <CardContent className="p-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {filteredSuggestions.slice(0, 6).map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {skill}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Counter and Validation */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{selectedSkills.length} of {maxSkills} skills</span>
        {!canAddMoreSkills && (
          <span className="text-orange-600">Maximum skills reached</span>
        )}
      </div>

      {/* Quick Add Common Skills */}
      {selectedSkills.length === 0 && !disabled && (
        <Card className="mt-3">
          <CardContent className="p-3">
            <p className="text-sm font-medium mb-2">Common Skills:</p>
            <div className="flex flex-wrap gap-1">
              {COMMON_SKILLS.slice(0, 6).map((skill) => (
                <Button
                  key={skill}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  className="h-6 px-2 text-xs"
                  disabled={selectedSkills.includes(skill)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {skill}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Skills validation utility
export const validateSkills = (skills: string[], maxSkills = 20, requiredSkills: string[] = []) => {
  const errors: string[] = [];

  if (skills.length === 0) {
    errors.push('At least one skill is required');
  }

  if (skills.length > maxSkills) {
    errors.push(`Maximum ${maxSkills} skills allowed`);
  }

  // Check for required skills
  const missingRequiredSkills = requiredSkills.filter(required => !skills.includes(required));
  if (missingRequiredSkills.length > 0) {
    errors.push(`Missing required skills: ${missingRequiredSkills.join(', ')}`);
  }

  // Check for duplicate skills (case-insensitive)
  const duplicates = skills.filter((skill, index) =>
    skills.findIndex(s => s.toLowerCase() === skill.toLowerCase()) !== index
  );
  if (duplicates.length > 0) {
    errors.push('Duplicate skills detected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Skills statistics utility for display
export const getSkillsStatistics = (allTechnicians: any[]) => {
  const skillsCount = new Map<string, number>();
  
  allTechnicians.forEach(technician => {
    technician.skills?.forEach((skill: string) => {
      skillsCount.set(skill, (skillsCount.get(skill) || 0) + 1);
    });
  });

  return Array.from(skillsCount.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);
};