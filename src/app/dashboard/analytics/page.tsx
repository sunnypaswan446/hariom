
'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useLoanStore } from '@/lib/store';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, CheckCircle, Clock, FileText, XCircle, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import type { CaseStatus } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const statusOrder: CaseStatus[] = [
  'Pending',
  'Under Review',
  'Approved',
  'Disbursed',
  'Rejected',
];

export default function AnalyticsPage() {
  const allCases = useLoanStore((state) => state.cases);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const cases = useMemo(() => {
    return allCases.filter((c) => {
      if (!c.applicationDate) return false;
      const applicationDate = parseISO(c.applicationDate);
      const dateMatch =
        !dateRange ||
        (!dateRange.from && !dateRange.to) ||
        (dateRange.from && !dateRange.to && applicationDate >= dateRange.from) ||
        (!dateRange.from && dateRange.to && applicationDate <= dateRange.to) ||
        (dateRange.from && dateRange.to && applicationDate >= dateRange.from && applicationDate <= dateRange.to);
      return dateMatch;
    });
  }, [allCases, dateRange]);


  const stats = useMemo(() => {
    return {
      total: cases.length,
      pending: cases.filter((c) => c.status === 'Pending').length,
      approved: cases.filter((c) => c.status === 'Approved').length,
      rejected: cases.filter((c) => c.status === 'Rejected').length,
    };
  }, [cases]);

  const casesByStatus = useMemo(() => {
    const counts = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<CaseStatus, number>);

    return statusOrder.map((status) => ({
      status,
      count: counts[status] || 0,
    }));
  }, [cases]);

  const casesOverTime = useMemo(() => {
    const counts = cases.reduce((acc, c) => {
      const month = new Date(c.applicationDate).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedMonths = Object.keys(counts).sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      return new Date(`${aMonth} 1, 20${aYear}`) > new Date(`${bMonth} 1, 20${bYear}`) ? 1 : -1;
    });

    return sortedMonths.map((month) => ({
      month,
      count: counts[month],
    }));
  }, [cases]);
  
  const disbursalData = useMemo(() => {
    const disbursedCases = cases.filter(c => c.status === 'Disbursed' && c.approvedAmount);
    const amounts = disbursedCases.reduce((acc, c) => {
        const month = new Date(c.applicationDate).toLocaleString('default', {
            month: 'short',
            year: '2-digit',
        });
        acc[month] = (acc[month] || 0) + c.approvedAmount!;
        return acc;
    }, {} as Record<string, number>);

    const sortedMonths = Object.keys(amounts).sort((a, b) => {
        const [aMonth, aYear] = a.split(' ');
        const [bMonth, bYear] = b.split(' ');
        return new Date(`${aMonth} 1, 20${aYear}`) > new Date(`${bMonth} 1, 20${bYear}`) ? 1 : -1;
    });

    return sortedMonths.map(month => ({
        month,
        amount: amounts[month]
    }));
  }, [cases]);

  const officerPerformance = useMemo(() => {
    const counts = cases.reduce((acc, c) => {
      if (!acc[c.teamMember]) {
        acc[c.teamMember] = { name: c.teamMember, total: 0 };
      }
      acc[c.teamMember].total++;
      return acc;
    }, {} as Record<string, { name: string; total: number }>);
    return Object.values(counts);
  }, [cases]);

  const currencyFormatter = (value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`;

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        description="Visualize loan case data and key performance metrics."
      >
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
          <PopoverContent className="w-auto p-0" align="end">
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
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Cases Added Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={casesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.2}
                    name="Cases"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Total Disbursed Amount</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disbursalData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickFormatter={currencyFormatter} tickLine={false} axisLine={false} width={80}/>
                            <ChartTooltip 
                              content={<ChartTooltipContent formatter={(value) => currencyFormatter(value as number)} />} 
                            />
                            <Bar dataKey="amount" name="Disbursed Amount" fill="var(--color-primary)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
         </Card>
         <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="status" width={100} tickLine={false} axisLine={false}/>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="Cases" fill="var(--color-primary)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 mt-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Team Member Workload</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false}/>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" name="Total Cases" fill="var(--color-accent)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
