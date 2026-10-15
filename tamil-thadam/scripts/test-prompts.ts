import { interviewPrompts, getCategory, randomPrompt } from "../src/lib/prompts";

console.log("Total categories:", interviewPrompts.length);
console.log("Total prompts:", interviewPrompts.reduce((n, c) => n + c.prompts.length, 0));

console.log("\nCategories:");
interviewPrompts.forEach((c) => console.log(`  ${c.id} -> ${c.prompts.length} prompts`));

const rand = randomPrompt();
console.log("\nRandom prompt category:", rand.categoryId);
console.log("Prompt length (chars):", rand.prompt.length);