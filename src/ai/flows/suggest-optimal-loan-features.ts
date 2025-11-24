'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest optimal loan features
 * based on applicant data and approval history.
 *
 * - suggestOptimalLoanFeatures - A function that suggests the best loan features.
 * - SuggestOptimalLoanFeaturesInput - The input type for the suggestOptimalLoanFeatures function.
 * - SuggestOptimalLoanFeaturesOutput - The return type for the suggestOptimalLoanFeatures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalLoanFeaturesInputSchema = z.object({
  applicantData: z
    .string()
    .describe('JSON string containing applicant data including credit score, income, employment history etc.'),
  approvalHistoryData: z
    .string()
    .describe('JSON string containing historical loan approval data, including loan features and outcomes.'),
});

export type SuggestOptimalLoanFeaturesInput = z.infer<
  typeof SuggestOptimalLoanFeaturesInputSchema
>;

const SuggestOptimalLoanFeaturesOutputSchema = z.object({
  suggestedLoanAmount: z.number().describe('The suggested loan amount.'),
  suggestedLoanType: z.string().describe('The suggested loan type.'),
  suggestedRepaymentTerms: z.string().describe('The suggested repayment terms.'),
  rationale: z.string().describe('Explanation of why these features are suggested.'),
});

export type SuggestOptimalLoanFeaturesOutput = z.infer<
  typeof SuggestOptimalLoanFeaturesOutputSchema
>;

export async function suggestOptimalLoanFeatures(
  input: SuggestOptimalLoanFeaturesInput
): Promise<SuggestOptimalLoanFeaturesOutput> {
  return suggestOptimalLoanFeaturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalLoanFeaturesPrompt',
  input: {schema: SuggestOptimalLoanFeaturesInputSchema},
  output: {schema: SuggestOptimalLoanFeaturesOutputSchema},
  prompt: `You are an AI loan expert. Given the applicant data and historical loan approval data, suggest the best combination of loan features (loan amount, loan type, repayment terms) to maximize approval chances and minimize risk.

Applicant Data: {{{applicantData}}}
Approval History Data: {{{approvalHistoryData}}}

Consider the following when creating the response:
*  Suggest only realistic loan amounts, loan types, and repayment terms.
*  The rationale should be no more than 5 sentences.
*  The suggestion should take into account both the applicant's data and the approval history data. If there are conflicts, err on the side of caution.

Here's the suggested output in JSON format:
{
  "suggestedLoanAmount": <suggested loan amount>,
  "suggestedLoanType": <suggested loan type>,
  "suggestedRepaymentTerms": <suggested repayment terms>,
  "rationale": <explanation of why these features are suggested>
}
`,
});

const suggestOptimalLoanFeaturesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalLoanFeaturesFlow',
    inputSchema: SuggestOptimalLoanFeaturesInputSchema,
    outputSchema: SuggestOptimalLoanFeaturesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
