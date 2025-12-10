
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from 'next/navigation';

import { loanCaseSchema } from '@/lib/schema';
import { useLoanStore } from '@/lib/store';
import { LOAN_TYPES, JOB_PROFILES, STATUS_OPTIONS, DOCUMENT_TYPES, CASE_TYPES } from '@/lib/data';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Upload, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import React from 'react';


type LoanCaseFormValues = z.infer<typeof loanCaseSchema>;
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5 MB

export default function AddLoanCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addCase, officers, banks } = useLoanStore();

  const form = useForm<LoanCaseFormValues>({
    resolver: zodResolver(loanCaseSchema),
    defaultValues: {
      applicantName: '',
      loanAmount: 0,
      loanType: 'Personal',
      applicationDate: new Date(),
      contactNumber: '',
      email: '',
      address: '',
      notes: '',
      salary: 0,
      location: '',
      panCardNumber: '',
      jobDesignation: '',
      referenceName: '',
      status: 'Document Pending',
      bankOfficeSm: '',
      documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: false, file: null })),
      tenure: 0,
      obligation: 0,
    },
  });

   const { fields, update } = useFieldArray({
    control: form.control,
    name: 'documents',
  });

  const handleFileChange = (index: number, file: File | null) => {
    if (file) {
      const currentFiles = form.getValues('documents');
      const currentTotalSize = currentFiles.reduce((sum, doc) => {
        if (doc.file instanceof File) {
          return sum + doc.file.size;
        }
        return sum;
      }, 0);

      const newTotalSize = currentTotalSize + file.size;

      if (newTotalSize > MAX_TOTAL_SIZE) {
        toast({
          variant: "destructive",
          title: "File Size Limit Exceeded",
          description: `Total file size cannot exceed 5 MB.`,
        });
        (document.getElementById(`doc-upload-${index}`) as HTMLInputElement).value = '';
        return;
      }
    }
    
    const currentDocument = form.getValues(`documents.${index}`);
    update(index, { ...currentDocument, uploaded: !!file, file });
  };
  
  const bankName = form.watch('bankName');

  function onSubmit(data: LoanCaseFormValues) {
    addCase({
      ...data,
      applicationDate: data.applicationDate.toISOString(),
      dob: data.dob.toISOString(),
    });
    toast({
      title: 'Case Added',
      description: `Loan case for ${data.applicantName} has been successfully created.`,
    });
    router.push('/dashboard');
  }

  return (
    <>
      <PageHeader
        title="Add New Loan Case"
        description="Fill in the details to create a new loan application case."
      />
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Applicant & Job Details</CardTitle></CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormField
                    control={form.control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.smith@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Anytown, USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Anytown, USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1960}
                              toYear={new Date().getFullYear() - 18}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="panCardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCDE1234F" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary (Monthly)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Profile</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a job profile" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {JOB_PROFILES.map((profile) => (
                              <SelectItem key={profile} value={profile}>
                                {profile}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobDesignation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referenceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Loan & Bank Details</CardTitle></CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormField
                    control={form.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Loan Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="tenure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenure (in months)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="24" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="obligation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Obligation</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a loan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOAN_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="caseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a case type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CASE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Application Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={new Date().getFullYear() - 10}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teamMember"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Member</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {officers.map((officer) => (
                              <SelectItem key={officer} value={officer}>
                                {officer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Notes / Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any relevant notes here..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                           <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {banks.map((bank) => (
                                  <SelectItem key={bank} value={bank}>
                                    {bank}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {bankName === 'Other' && (
                       <FormField
                        control={form.control}
                        name="otherBankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="bankOfficeSm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Office/SM</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Downtown Branch / John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Document Uploads</CardTitle>
                    <FormDescription>Upload the required documents for the application. Total size cannot exceed 5MB.</FormDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field, index) => (
                    <FormItem key={field.id}>
                        <FormLabel>{field.type}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input
                                    type="file"
                                    className="hidden"
                                    id={`doc-upload-${index}`}
                                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                                />
                                <label
                                    htmlFor={`doc-upload-${index}`}
                                    className={cn(
                                        "flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent",
                                        field.uploaded && "border-green-500"
                                    )}
                                >
                                    <span className={cn("truncate", field.file ? "text-foreground" : "text-muted-foreground")}>
                                      {field.file ? field.file.name : `Upload ${field.type}`}
                                    </span>
                                    {field.file ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 ml-2"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleFileChange(index, null);
                                                (document.getElementById(`doc-upload-${index}`) as HTMLInputElement).value = '';
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </label>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Create Case</Button>
            </div>
          </form>
        </Form>
      
    </>
  );
}
