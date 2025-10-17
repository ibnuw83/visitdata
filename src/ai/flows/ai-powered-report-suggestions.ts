'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered suggestions for reports based on current data trends.
 *
 * - `getReportSuggestions` - A function that generates report suggestions.
 * - `ReportSuggestionsInput` - The input type for the `getReportSuggestions` function.
 * - `ReportSuggestionsOutput` - The return type for the `getReportSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSuggestionsInputSchema = z.object({
  currentMonthDataSummary: z
    .string()
    .describe(
      'A summary of the current month data, including visitor numbers, trends, and notable events.'
    ),
  historicalDataSummary: z
    .string()
    .describe(
      'A summary of historical data, including year-over-year comparisons and long-term trends.'
    ),
  destinationCategory: z
    .string()
    .describe(
      'The destination category, e.g., "alam", "budaya", "sejarah".'
    ),
});
export type ReportSuggestionsInput = z.infer<typeof ReportSuggestionsInputSchema>;

const ReportSuggestionsOutputSchema = z.object({
    suggestions: z.array(z.object({
        title: z.string().describe("The concise and compelling title for the suggested report."),
        description: z.string().describe("A brief explanation of what the report would analyze and why it's valuable."),
        chartType: z.string().describe("A suggested chart type for visualization (e.g., 'Bar Chart', 'Line Chart', 'Pie Chart').")
    })).describe("An array of 3-5 creative and insightful report suggestions.")
});
export type ReportSuggestionsOutput = z.infer<typeof ReportSuggestionsOutputSchema>;

export async function getReportSuggestions(input: ReportSuggestionsInput): Promise<ReportSuggestionsOutput> {
  return reportSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportSuggestionsPrompt',
  input: {schema: ReportSuggestionsInputSchema},
  output: {schema: ReportSuggestionsOutputSchema},
  prompt: `You are a Senior Data Analyst for a tourism department. Your task is to generate creative and insightful report suggestions based on the provided data summaries.

  The destination category is '{{{destinationCategory}}}'.

  Consider the following data:
  - Current Month Summary: {{{currentMonthDataSummary}}}
  - Historical Data Summary: {{{historicalDataSummary}}}

  Based on this data, provide 3 to 5 unique, actionable, and insightful report ideas. For each suggestion, provide a compelling title, a brief description of its value, and a recommended chart type.

  Focus on uncovering hidden trends, potential opportunities, or areas for improvement. For example, you could suggest reports on:
  - The impact of cultural events on international tourist numbers.
  - A comparative analysis of visitor growth between different types of destinations.
  - An analysis of which nationalities are most interested in historical sites.

  Generate the suggestions now.`,
});

const reportSuggestionsFlow = ai.defineFlow(
  {
    name: 'reportSuggestionsFlow',
    inputSchema: ReportSuggestionsInputSchema,
    outputSchema: ReportSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
