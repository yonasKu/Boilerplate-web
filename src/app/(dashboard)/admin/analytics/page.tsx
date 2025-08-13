'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Demo analytics data
const userGrowthData = [
  { date: "Aug 1", users: 1200 },
  { date: "Aug 2", users: 1215 },
  { date: "Aug 3", users: 1230 },
  { date: "Aug 4", users: 1245 },
  { date: "Aug 5", users: 1258 },
  { date: "Aug 6", users: 1265 },
  { date: "Aug 7", users: 1272 },
  { date: "Aug 8", users: 1280 },
  { date: "Aug 9", users: 1295 },
  { date: "Aug 10", users: 1302 },
  { date: "Aug 11", users: 1320 },
  { date: "Aug 12", users: 1340 },
];

const subscriptionData = [
  { plan: "Free", users: 506 },
  { plan: "Premium", users: 842 },
  { plan: "Trial", users: 124 },
];

const referralData = [
  { source: "Social Media", referrals: 240, conversions: 85 },
  { source: "Email", referrals: 180, conversions: 65 },
  { source: "Direct", referrals: 120, conversions: 45 },
  { source: "Other", referrals: 80, conversions: 30 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button>Export Report</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,340</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">842</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">225</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12m 34s</div>
            <p className="text-xs text-muted-foreground">+2m from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Daily user signups over the past 12 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowthData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Breakdown of users by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subscriptionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral Sources</CardTitle>
            <CardDescription>Track referral sources and conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralData.map((source, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{source.source}</TableCell>
                    <TableCell>{source.referrals}</TableCell>
                    <TableCell>{source.conversions}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {((source.conversions / source.referrals) * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usage Metrics</CardTitle>
            <CardDescription>Key application usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Daily Active Users</span>
              <span className="font-bold">842</span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Active Users</span>
              <span className="font-bold">1,120</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Active Users</span>
              <span className="font-bold">1,340</span>
            </div>
            <div className="flex justify-between">
              <span>Feature Adoption Rate</span>
              <span className="font-bold">78%</span>
            </div>
            <div className="flex justify-between">
              <span>User Retention (7-day)</span>
              <span className="font-bold">82%</span>
            </div>
            <div className="flex justify-between">
              <span>User Retention (30-day)</span>
              <span className="font-bold">65%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
