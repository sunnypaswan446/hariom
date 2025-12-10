
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useLoanStore } from '@/lib/store';
import { statusUpdateSchema } from '@/lib/schema';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { CaseStatus, DocumentType } from '@/lib/types';
import {
  ArrowLeft,
  Briefcase,
  Cake,
  Calendar,
  Contact,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  Flag,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  User,
  Users,
  CheckCircle,
  Circle,
  Percent,
  Clock,
  Shield,
  FileSymlink,
  Download,
  Upload
} from 'lucide-react';
import React from 'react';
import { STATUS_OPTIONS } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5 MB

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { getCaseById, updateCaseStatus, updateCaseDocument } = useLoanStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const loanCase = getCaseById(params.id as string);

  const form = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: loanCase?.status,
      remarks: '',
      approvedAmount: loanCase?.approvedAmount || undefined,
      roi: loanCase?.roi || undefined,
      approvedTenure: loanCase?.approvedTenure || undefined,
      processingFee: loanCase?.processingFee || undefined,
      insuranceAmount: loanCase?.insuranceAmount || undefined,
    },
  });

  const selectedStatus = form.watch('status');

  if (!loanCase) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Loan case not found.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  function onSubmit(data: StatusUpdateFormValues) {
    updateCaseStatus(loanCase!.id, data.status, data.remarks, {
      approvedAmount: data.approvedAmount,
      roi: data.roi,
      approvedTenure: data.approvedTenure,
      processingFee: data.processingFee,
      insuranceAmount: data.insuranceAmount,
    });
    toast({
      title: 'Status Updated',
      description: `Case ${loanCase!.id} has been updated to ${data.status}.`,
    });
    form.reset({ ...data, remarks: '' });
    setIsDialogOpen(false);
  }

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-1" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
  
  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleFileUpload = (docType: DocumentType, file: File) => {
    if (loanCase) {
      const currentTotalSize = loanCase.documents.reduce((sum, doc) => {
        if (doc.file instanceof File) {
          return sum + doc.file.size;
        }
        return sum;
      }, 0);

      if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
        toast({
          variant: "destructive",
          title: "File Size Limit Exceeded",
          description: `Total file size cannot exceed 5 MB.`,
        });
        return;
      }
      
      updateCaseDocument(loanCase.id, docType, file);
      toast({
        title: "Document Uploaded",
        description: `${docType} has been successfully uploaded.`,
      });
    }
  };

  const approvedStatuses: CaseStatus[] = ['Approved', 'Disbursed'];

  return (
    <>
      <PageHeader title={`Case ID: ${loanCase.id}`}>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft />
          Back to Dashboard
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Pencil />
              Update Status
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Case Status</DialogTitle>
              <DialogDescription>
                Select a new status and add remarks for the update.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., All documents verified."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {approvedStatuses.includes(selectedStatus as CaseStatus) && (
                   <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium text-foreground">Approval Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name="approvedAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Approved Amount</FormLabel>
                                    <FormControl><Input type="number" placeholder="5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="roi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ROI (%)</FormLabel>
                                    <FormControl><Input type="number" placeholder="8.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="approvedTenure"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Approved Tenure</FormLabel>
                                    <FormControl><Input type="number" placeholder="24" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="processingFee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Processing Fee</FormLabel>
                                    <FormControl><Input type="number" placeholder="100" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="insuranceAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Insurance Amount</FormLabel>
                                    <FormControl><Input type="number" placeholder="50" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                      </div>
                   </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Update</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicant & Job Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
               <DetailItem
                icon={User}
                label="Applicant Name"
                value={loanCase.applicantName}
              />
              <DetailItem icon={Mail} label="Email" value={loanCase.email} />
              <DetailItem
                icon={Contact}
                label="Contact Number"
                value={loanCase.contactNumber}
              />
              <DetailItem icon={MapPin} label="Address" value={loanCase.address} />
              <DetailItem icon={MapPin} label="Location" value={loanCase.location} />
              <DetailItem icon={Cake} label="Date of Birth" value={new Date(loanCase.dob).toLocaleDateString()} />
              <DetailItem icon={CreditCard} label="PAN Card" value={loanCase.panCardNumber} />
               <DetailItem
                icon={DollarSign}
                label="Salary (Monthly)"
                value={new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(loanCase.salary)}
              />
              <DetailItem icon={Briefcase} label="Job Profile" value={loanCase.jobProfile} />
              <DetailItem icon={Briefcase} label="Job Designation" value={loanCase.jobDesignation} />
              <DetailItem icon={Users} label="Reference Name" value={loanCase.referenceName} />
              <DetailItem
                icon={User}
                label="Team Member"
                value={loanCase.teamMember}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Loan & Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <DetailItem
                icon={DollarSign}
                label="Required Loan Amount"
                value={new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(loanCase.loanAmount)}
              />
              <DetailItem icon={Clock} label="Tenure (months)" value={loanCase.tenure} />
              <DetailItem icon={FileCheck} label="Loan Type" value={loanCase.loanType} />
              <DetailItem icon={FileSymlink} label="Case Type" value={loanCase.caseType} />
               <DetailItem
                icon={DollarSign}
                label="Obligation"
                value={new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(loanCase.obligation)}
              />
              <DetailItem
                icon={Calendar}
                label="Application Date"
                value={new Date(loanCase.applicationDate).toLocaleDateString()}
              />
              <DetailItem 
                icon={Flag} 
                label="Current Status" 
                value={<StatusBadge status={loanCase.status} />}
              />
               <DetailItem
                icon={Landmark}
                label="Bank Name"
                value={loanCase.bankName === 'Other' ? loanCase.otherBankName : loanCase.bankName}
              />
               <DetailItem
                icon={Briefcase}
                label="Bank Office/SM"
                value={loanCase.bankOfficeSm}
              />
              <DetailItem
                icon={FileText}
                label="Notes"
                value={loanCase.notes || 'N/A'}
              />
            </CardContent>
          </Card>

           {approvedStatuses.includes(loanCase.status) && (
              <Card>
                <CardHeader>
                  <CardTitle>Approved Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6">
                   <DetailItem
                    icon={DollarSign}
                    label="Approved Amount"
                    value={loanCase.approvedAmount ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(loanCase.approvedAmount) : 'N/A'}
                  />
                   <DetailItem
                    icon={Percent}
                    label="Rate of Interest (ROI)"
                    value={loanCase.roi ? `${loanCase.roi}%` : 'N/A'}
                  />
                   <DetailItem
                    icon={Clock}
                    label="Approved Tenure (months)"
                    value={loanCase.approvedTenure || 'N/A'}
                  />
                   <DetailItem
                    icon={FileText}
                    label="Processing Fee"
                     value={loanCase.processingFee ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(loanCase.processingFee) : 'N/A'}
                  />
                   <DetailItem
                    icon={Shield}
                    label="Insurance Amount"
                    value={loanCase.insuranceAmount ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(loanCase.insuranceAmount) : 'N/A'}
                  />
                </CardContent>
              </Card>
           )}

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>Total file size cannot exceed 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {loanCase.documents.map(doc => {
                    const content = (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {doc.uploaded ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                          <span className="font-medium">{doc.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.uploaded ? "secondary" : "outline"}>
                            {doc.uploaded ? "Uploaded" : "Pending"}
                          </Badge>
                          {doc.uploaded && doc.file && (
                             <Download className="h-5 w-5 text-muted-foreground" />
                          )}
                          {!doc.uploaded && (
                            <>
                              <Input
                                type="file"
                                id={`upload-${doc.type}`}
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(doc.type, e.target.files[0]);
                                  }
                                }}
                              />
                              <label htmlFor={`upload-${doc.type}`} className="cursor-pointer">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    );

                    return (
                        <li key={doc.type}>
                          {doc.uploaded && doc.file ? (
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (doc.file instanceof File) {
                                    handleDownload(doc.file);
                                } else {
                                    toast({
                                        variant: "destructive",
                                        title: "Download Error",
                                        description: "File is not available for download.",
                                    })
                                }
                              }}
                              className="flex items-center justify-between p-2 -m-2 rounded-md hover:bg-muted"
                            >
                              {content}
                            </a>
                          ) : (
                            <div className="flex items-center justify-between p-2 -m-2">
                              {content}
                            </div>
                          )}
                        </li>
                    );
                })}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {loanCase.history.length > 0 ? (
                <div className="space-y-6">
                  {loanCase.history.slice().reverse().map((update, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                          <FileCheck className="h-4 w-4 text-secondary-foreground" />
                        </div>
                        {index < loanCase.history.length - 1 && (
                          <div className="h-full w-px bg-border" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            Status changed to <StatusBadge status={update.status} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{update.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No status updates yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          {/* This space can be used for other cards if needed in the future */}
        </div>
      </div>
    </>
  );
}

    