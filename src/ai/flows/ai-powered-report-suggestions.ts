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
      'The destination category, e.g., 