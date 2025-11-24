
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
import { MoreHorizontal, PlusCircle, Download, Search } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { CaseStatus, LoanCase, Officer } from '@/lib/types';
import { OFFICERS, STATUS_OPTIONS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { cases, updateCaseStatus } = useLoanStore();
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [officerFilter, setOfficerFilter] = useState<Officer | 'all'>('all');

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
      return searchMatch && statusMatch && officerMatch;
    });
  }, [cases, searchTerm, statusFilter, officerFilter]);

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
          <div className="flex items-center gap-4 p-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or loan type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger className="w-[180px]">
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Team Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {OFFICERS.map((officer) => (
                    <SelectItem key={officer} value={officer}>
                      {officer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
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
