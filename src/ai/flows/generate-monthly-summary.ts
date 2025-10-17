'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a summary of a monthly report, highlighting key trends and insights.
 *
 * - generateMonthlySummary - A function that generates a summary of the monthly report.
 * - GenerateMonthlySummaryInput - The input type for the generateMonthlySummary function.
 * - GenerateMonthlySummaryOutput - The return type for the generateMonthlySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlySummaryInputSchema = z.object({
  monthName: z.string().describe('The name of the month for the report.'),
  year: z.number().describe('The year for the report.'),
  destinationName: z.string().describe('The name of the destination.'),
  totalVisitors: z.number().describe('Total number of visitors for the month.'),
  wisnus: z.number().describe('Number of domestic tourists for the month.'),
  wisman: z.number().describe('Number of international tourists for the month.'),
  eventVisitors: z.number().describe('Number of visitors to cultural events for the month.'),
  historicalVisitors: z.number().describe('Number of visitors to historical sites for the month.'),
  wismanDetails: z.array(
    z.object({
      country: z.string(),
      count: z.number(),
    })
  ).describe('List of countries and their corresponding visitor counts.'),
});
export type GenerateMonthlySummaryInput = z.infer<typeof GenerateMonthlySummaryInputSchema>;

const GenerateMonthlySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the monthly report, highlighting key trends and insights.'),
});
export type GenerateMonthlySummaryOutput = z.infer<typeof GenerateMonthlySummaryOutputSchema>;

export async function generateMonthlySummary(input: GenerateMonthlySummaryInput): Promise<GenerateMonthlySummaryOutput> {
  return generateMonthlySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlySummaryPrompt',
  input: {schema: GenerateMonthlySummaryInputSchema},
  output: {schema: GenerateMonthlySummaryOutputSchema},
  prompt: `You are an AI assistant helping an admin understand a monthly tourism report.

  Please provide a concise summary of the following monthly report, highlighting key trends and insights.
  Be sure to mention the destination, month, and year in the summary.
  Also include the total number of visitors, and highlight any significant changes or trends in visitor numbers, origin countries, or event attendance.

  Month: {{{monthName}}}
  Year: {{{year}}}
  Destination: {{{destinationName}}}
  Total Visitors: {{{totalVisitors}}}
  Domestic Tourists (Wisnus): {{{wisnus}}}
  International Tourists (Wisman): {{{wisman}}}
  Cultural Event Visitors: {{{eventVisitors}}}
  Historical Site Visitors: {{{historicalVisitors}}}
  International Tourist Details (Wisman):
  {{#each wismanDetails}}
    - {{{country}}}: {{{count}}}
  {{/each}}
  `,
});

const generateMonthlySummaryFlow = ai.defineFlow(
  {
    name: 'generateMonthlySummaryFlow',
    inputSchema: GenerateMonthlySummaryInputSchema,
    outputSchema: GenerateMonthlySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
