'use server';

/**
 * @fileOverview An AI agent for generating restock suggestions based on sales history and stock levels.
 *
 * - generateRestockSuggestions - A function that generates restock suggestions.
 * - AiRestockSuggestionsInput - The input type for the generateRestockSuggestions function.
 * - AiRestockSuggestionsOutput - The return type for the generateRestockSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiRestockSuggestionsInputSchema = z.object({
  salesHistory: z
    .string()
    .describe('Sales history data, including product ID, date, and quantity sold.'),
  stockLevels: z
    .string()
    .describe('Current stock levels for each product, including product ID and quantity.'),
});
export type AiRestockSuggestionsInput = z.infer<typeof AiRestockSuggestionsInputSchema>;

const AiRestockSuggestionsOutputSchema = z.object({
  restockSuggestions: z
    .string()
    .describe('A list of restock suggestions, including product ID and quantity to restock.'),
});
export type AiRestockSuggestionsOutput = z.infer<typeof AiRestockSuggestionsOutputSchema>;

export async function generateRestockSuggestions(
  input: AiRestockSuggestionsInput
): Promise<AiRestockSuggestionsOutput> {
  return aiRestockSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRestockSuggestionsPrompt',
  input: {schema: AiRestockSuggestionsInputSchema},
  output: {schema: AiRestockSuggestionsOutputSchema},
  prompt: `You are an AI assistant that analyzes sales history and current stock levels to generate restock suggestions for a clothing store.

Analyze the following sales history data:
{{{salesHistory}}}

And the following current stock levels:
{{{stockLevels}}}

Based on this data, provide a list of restock suggestions, including the product ID and quantity to restock. Consider recent trends, seasonality, and the rate at which stock levels deplete.

Format your response as a list of product IDs and quantities to restock, separated by commas.
Example: ProductA: 25, ProductB: 50, ProductC: 15`,
});

const aiRestockSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiRestockSuggestionsFlow',
    inputSchema: AiRestockSuggestionsInputSchema,
    outputSchema: AiRestockSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
