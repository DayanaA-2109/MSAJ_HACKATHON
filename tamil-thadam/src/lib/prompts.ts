// src/lib/prompts.ts
import promptsData from "@/data/interview-prompts.json";

export type InterviewCategory = {
  id: string;
  name_ta: string;
  name_en: string;
  prompts: string[];
};

export const interviewPrompts = promptsData.categories as InterviewCategory[];

export function getCategory(id: string): InterviewCategory | undefined {
  return interviewPrompts.find((c) => c.id === id);
}

export function randomPrompt(): { categoryId: string; categoryName: string; prompt: string } {
  const cat = interviewPrompts[Math.floor(Math.random() * interviewPrompts.length)];
  const prompt = cat.prompts[Math.floor(Math.random() * cat.prompts.length)];
  return { categoryId: cat.id, categoryName: cat.name_ta, prompt };
}