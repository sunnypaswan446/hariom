
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoanStore } from '@/lib/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Download, Search, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { CaseStatus, LoanCase, Officer } from '@/lib/types';
import { STATUS_OPTIONS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { parseISO, startOfMonth, endOfMonth, getYear, getMonth, format } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
        years.push(i);
    }
    return years;
};

export default function DashboardPage() {
  const { cases, updateCaseStatus, officers, fetchCases, isLoading } = useLoanStore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [officerFilter, setOfficerFilter] = useState<Officer | 'all'>('all');

  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date());

  const [fromMonth, setFromMonth] = useState<number>(currentMonth);
  const [fromYear, setFromYear] = useState<number>(currentYear);
  const [toMonth, setToMonth] = useState<number>(currentMonth);
  const [toYear, setToYear] = useState<number>(currentYear);
  
  const years = useMemo(() => getYears(), []);


  const handleStatusChange = (caseId: string, newStatus: CaseStatus) => {
    updateCaseStatus(caseId, newStatus, `Status updated from dashboard.`);
    toast({
      title: 'Status Updated',
      description: `Case ${caseId} has been updated to ${newStatus}.`,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setOfficerFilter('all');
    setFromMonth(currentMonth);
    setFromYear(currentYear);
    setToMonth(currentMonth);
    setToYear(currentYear);
  };

  const filteredCases = useMemo(() => {
    const fromDate = startOfMonth(new Date(fromYear, fromMonth));
    const toDate = endOfMonth(new Date(toYear, toMonth));

    return cases.filter((c) => {
      const searchMatch =
        c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactNumber.includes(searchTerm) ||
        c.caseType.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || c.status === statusFilter;
      const officerMatch =
        officerFilter === 'all' || c.teamMember === officerFilter;
      
      const applicationDate = parseISO(c.applicationDate);
      const dateMatch = applicationDate >= fromDate && applicationDate <= toDate;

      return searchMatch && statusMatch && officerMatch && dateMatch;
    });
  }, [cases, searchTerm, statusFilter, officerFilter, fromMonth, fromYear, toMonth, toYear]);
  
  const stats = useMemo(() => {
    const relevantCases = cases.filter(c => {
        const fromDate = startOfMonth(new Date(fromYear, fromMonth));
        const toDate = endOfMonth(new Date(toYear, toMonth));
        const applicationDate = parseISO(c.applicationDate);
        return applicationDate >= fromDate && applicationDate <= toDate;
    });
    return {
      complete: relevantCases.filter((c) => c.status === 'Complete').length,
      login: relevantCases.filter((c) => c.status === 'Login').length,
      inProgress: relevantCases.filter((c) => c.status === 'In Progress').length,
      approved: relevantCases.filter((c) => c.status === 'Approved').length,
      disbursed: relevantCases.filter((c) => c.status === 'Disbursed').length,
    };
  }, [cases, fromMonth, fromYear, toMonth, toYear]);

  return (
    <>
      <PageHeader
        title="Loan Cases Dashboard"
        description="Manage and track all loan applications."
      >
        <Button asChild>
          <Link href="/dashboard/new">
            <PlusCircle />
            Add New Case
          </Link>
        </Button>
        <Button variant="outline">
          <Download />
          Export
        </Button>
      </PageHeader>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{stats.complete}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{stats.login}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold">{stats.disbursed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b space-y-4">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                placeholder="Search by name, phone, or case type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex w-full md:w-auto items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as any)}
                >
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                       <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={officerFilter}
                  onValueChange={(value) => setOfficerFilter(value as any)}
                >
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Filter by Team Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Members</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer} value={officer}>
                        {officer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-full flex-col md:flex-row items-center gap-2">
                  <div className="flex w-full items-center gap-2">
                    <Select value={String(fromMonth)} onValueChange={(v) => setFromMonth(Number(v))}>
                      <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="From Month" /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     <Select value={String(fromYear)} onValueChange={(v) => setFromYear(Number(v))}>
                      <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="From Year" /></SelectTrigger>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-muted-foreground">to</span>
                  <div className="flex w-full items-center gap-2">
                    <Select value={String(toMonth)} onValueChange={(v) => setToMonth(Number(v))}>
                      <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="To Month" /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={String(toYear)} onValueChange={(v) => setToYear(Number(v))}>
                      <SelectTrigger className="w-full md:w-auto"><SelectValue placeholder="To Year" /></SelectTrigger>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={handleResetFilters}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead className="text-right">Required Loan Amount</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((loanCase) => (
                    <TableRow 
                      key={loanCase.id}
                      onClick={() => router.push(`/dashboard/case/${loanCase.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {loanCase.applicantName}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        }).format(loanCase.loanAmount)}
                      </TableCell>
                      <TableCell>{loanCase.caseType}</TableCell>
                      <TableCell>
                        {format(parseISO(loanCase.applicationDate), 'dd-MMM-yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={loanCase.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Link href={`/dashboard/case/${loanCase.id}`} className="w-full h-full">
                                View Details
                              </Link>
                            </DropdownMenuItem>
                             <DropdownMenuSub>
                              <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                                <span>Update Status</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  {STATUS_OPTIONS.map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(loanCase.id, status)
                                      }}
                                      disabled={loanCase.status === status}
                                    >
                                      {status}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No cases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
    

    
