export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech: string[];
  link?: string;
  featured?: boolean;
}

export interface QuickPrompt {
  label: string;
  prompt: string;
  iconName: string;
}
