
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { suggestOptimalLoanFeatures, SuggestOptimalLoanFeaturesOutput } from '@/ai/flows/suggest-optimal-loan-features';
import { useLoanStore } from '@/lib/store';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, FileText, Landmark, CalendarDays } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const applicantSchema = z.object({
  creditScore: z.coerce.number().min(300).max(850),
  income: z.coerce.number().positive(),
  employmentHistory: z.string().min(1, "Employment history is required."),
});

type ApplicantFormValues = z.infer<typeof applicantSchema>;

export default function SuggestionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestOptimalLoanFeaturesOutput | null>(null);
  const cases = useLoanStore(state => state.cases);

  const form = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      creditScore: 680,
      income: 75000,
      employmentHistory: '5 years at current job'
    }
  });

  const handleSubmit = async (data: ApplicantFormValues) => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    const applicantData = JSON.stringify(data);
    const approvalHistoryData = JSON.stringify(cases.map(c => ({
      loanAmount: c.loanAmount,
      loanType: c.loanType,
      status: c.status,
    })));

    try {
      const result = await suggestOptimalLoanFeatures({
        applicantData,
        approvalHistoryData,
      });
      setSuggestion(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SuggestionCard = ({ icon: Icon, title, value, isCurrency = false }: { icon: React.ElementType, title: string, value: string | number, isCurrency?: boolean }) => (
    <div className="flex items-start gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-lg">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold">
          {isCurrency ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value)) : value}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="AI Loan Suggestion Tool"
        description="Get intelligent recommendations for loan features to maximize approval rates."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Applicant Data</CardTitle>
            <CardDescription>Enter the applicant's financial details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="creditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Score</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employmentHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment History</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2" />Generate Suggestions</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-lg border border-dashed"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold">Generating Suggestions...</h3>
                <p className="text-muted-foreground">Our AI is analyzing the data to find the optimal loan features.</p>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            {suggestion && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className="text-primary" />
                      AI-Powered Loan Suggestions
                    </CardTitle>
                    <CardDescription>Based on the provided data, here are the recommended loan features.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <SuggestionCard icon={FileText} title="Suggested Loan Amount" value={suggestion.suggestedLoanAmount} isCurrency />
                      <SuggestionCard icon={Landmark} title="Suggested Loan Type" value={suggestion.suggestedLoanType} />
                      <SuggestionCard icon={CalendarDays} title="Suggested Repayment Terms" value={suggestion.suggestedRepaymentTerms} />
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Rationale</h4>
                      <p className="text-muted-foreground bg-secondary/50 p-4 rounded-md border">{suggestion.rationale}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {!loading && !suggestion && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-lg border border-dashed">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Ready to Get Suggestions?</h3>
                    <p className="text-muted-foreground">Fill out the applicant data form to get started.</p>
                </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
