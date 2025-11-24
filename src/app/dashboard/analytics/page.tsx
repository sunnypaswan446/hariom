'use client';

import { useMemo } from 'react';
import { BarChart, DonutChart, LineChart } from '@tremor/react';
import { useLoanStore } from '@/lib/store';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import type { CaseStatus } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const statusOrder: CaseStatus[] = [
  'Pending',
  'Under Review',
  'Approved',
  'Disbursed',
  'Rejected',
];

export default function AnalyticsPage() {
  const cases = useLoanStore((state) => state.cases);

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

  const loanTypesData = useMemo(() => {
    const counts = cases.reduce((acc, c) => {
      acc[c.loanType] = (acc[c.loanType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
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

  return (
    <>
      <PageHeader
        title="Analytics Dashboard"
        description="Visualize loan case data and key performance metrics."
      />
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

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loan Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={loanTypesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    fill="var(--color-primary)"
                    labelLine={false}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="hsl(var(--primary-foreground))"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-xs font-medium"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  />
                   <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-2">
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
                  <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

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
                  <Bar dataKey="total" fill="var(--color-accent)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
