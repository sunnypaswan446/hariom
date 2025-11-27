
'use client';

import { useState, useMemo } from 'react';
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
import { MoreHorizontal, PlusCircle, Download, Search, Calendar as CalendarIcon } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { CaseStatus, LoanCase, Officer } from '@/lib/types';
import { STATUS_OPTIONS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

export default function DashboardPage() {
  const { cases, updateCaseStatus, officers } = useLoanStore();
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [officerFilter, setOfficerFilter] = useState<Officer | 'all'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);


  const handleStatusChange = (caseId: string, newStatus: CaseStatus) => {
    updateCaseStatus(caseId, newStatus, `Status updated from dashboard.`);
    toast({
      title: 'Status Updated',
      description: `Case ${caseId} has been updated to ${newStatus}.`,
    });
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const searchMatch =
        c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactNumber.includes(searchTerm) ||
        c.loanType.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || c.status === statusFilter;
      const officerMatch =
        officerFilter === 'all' || c.teamMember === officerFilter;
      
      const applicationDate = parseISO(c.applicationDate);
      const dateMatch =
        !dateRange ||
        (!dateRange.from && !dateRange.to) ||
        (dateRange.from && !dateRange.to && applicationDate >= dateRange.from) ||
        (!dateRange.from && dateRange.to && applicationDate <= dateRange.to) ||
        (dateRange.from && dateRange.to && applicationDate >= dateRange.from && applicationDate <= dateRange.to);

      return searchMatch && statusMatch && officerMatch && dateMatch;
    });
  }, [cases, searchTerm, statusFilter, officerFilter, dateRange]);

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

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b space-y-4">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                placeholder="Search by name, phone, or loan type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
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
                <SelectTrigger className="w-full md:w-[180px]">
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
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full md:w-auto justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead className="text-right">Required Loan Amount</TableHead>
                  <TableHead>Loan Type</TableHead>
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
                      <TableCell>{loanCase.loanType}</TableCell>
                      <TableCell>
                        {new Date(loanCase.applicationDate).toLocaleDateString()}
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
