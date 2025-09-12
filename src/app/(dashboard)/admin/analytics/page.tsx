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
import { useEffect, useState } from 'react';
import { collection, getCountFromServer, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AnalyticsPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeSubs, setActiveSubs] = useState<number | null>(null);
  const [refConversions, setRefConversions] = useState<number | null>(null);
  const [dau, setDau] = useState<number | null>(null);
  const [wau, setWau] = useState<number | null>(null);
  const [mau, setMau] = useState<number | null>(null);

  const [growthData, setGrowthData] = useState<{ date: string; users: number }[]>([]);
  const [subDist, setSubDist] = useState<{ plan: string; users: number }[]>([
    { plan: 'Free', users: 0 },
    { plan: 'Premium', users: 0 },
    { plan: 'Trial', users: 0 },
  ]);
  const [referralRows, setReferralRows] = useState<{ source: string; referrals: number; conversions: number }[]>([]);

  // Live user growth (last 12 days) from users.createdAt
  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 11);
    from.setHours(0, 0, 0, 0);
    const qUsers = query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(from)),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(qUsers, (snap) => {
      const byDay = new Map<string, number>();
      for (let i = 0; i < 12; i++) {
        const d = new Date(from);
        d.setDate(from.getDate() + i);
        const key = d.toISOString().slice(5, 10); // MM-DD
        byDay.set(key, 0);
      }
      snap.forEach((doc) => {
        const ts = (doc.data() as any)?.createdAt as Timestamp | undefined;
        if (!ts) return;
        const key = ts.toDate().toISOString().slice(5, 10);
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1);
      });
      const arr = Array.from(byDay.entries()).map(([date, users]) => ({ date, users }));
      setGrowthData(arr);
    });
    return () => unsub();
  }, []);

  // KPIs and distributions via aggregate counts
  useEffect(() => {
    const run = async () => {
      try {
        const usersColl = collection(db, 'users');
        const total = await getCountFromServer(usersColl);
        setTotalUsers(total.data().count);

        const active = await getCountFromServer(query(usersColl, where('subscription.status', '==', 'active')));
        setActiveSubs(active.data().count);

        const completed = await getCountFromServer(query(collection(db, 'referrals'), where('status', '==', 'completed')));
        setRefConversions(completed.data().count);

        // DAU/WAU/MAU based on lastActiveAt
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const dauSnap = await getCountFromServer(query(usersColl, where('lastActiveAt', '>=', Timestamp.fromDate(startOfDay))));
        setDau(dauSnap.data().count);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const wauSnap = await getCountFromServer(query(usersColl, where('lastActiveAt', '>=', Timestamp.fromDate(startOfWeek))));
        setWau(wauSnap.data().count);

        const startOfMonth = new Date();
        startOfMonth.setDate(startOfMonth.getDate() - 30);
        const mauSnap = await getCountFromServer(query(usersColl, where('lastActiveAt', '>=', Timestamp.fromDate(startOfMonth))));
        setMau(mauSnap.data().count);

        // Subscription distribution
        const free = await getCountFromServer(query(usersColl, where('subscription.plan', '==', 'Free')));
        const premium = await getCountFromServer(query(usersColl, where('subscription.plan', '==', 'Premium')));
        const trial = await getCountFromServer(query(usersColl, where('subscription.plan', '==', 'Trial')));
        setSubDist([
          { plan: 'Free', users: free.data().count },
          { plan: 'Premium', users: premium.data().count },
          { plan: 'Trial', users: trial.data().count },
        ]);

        // Referral summary table by status (as a proxy for sources)
        const pending = await getCountFromServer(query(collection(db, 'referrals'), where('status', '==', 'pending')));
        const expired = await getCountFromServer(query(collection(db, 'referrals'), where('status', '==', 'expired')));
        setReferralRows([
          { source: 'Completed', referrals: refConversions ?? completed.data().count, conversions: completed.data().count },
          { source: 'Pending', referrals: pending.data().count, conversions: 0 },
          { source: 'Expired', referrals: expired.data().count, conversions: 0 },
        ]);
      } catch (e) {
        console.error('Failed to load analytics metrics', e);
      }
    };
    run();
  }, []);

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
            <div className="text-2xl font-bold">{totalUsers ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Live</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubs ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Users with active plan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refConversions ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Completed referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Coming from analytics backend</p>
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
                  data={growthData}
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
                  data={subDist}
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
            <CardTitle>Referrals Summary</CardTitle>
            <CardDescription>Counts by referral status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.source}</TableCell>
                    <TableCell>{row.referrals}</TableCell>
                    <TableCell>{row.conversions}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {row.referrals > 0 ? ((row.conversions / row.referrals) * 100).toFixed(1) + '%' : '0%'}
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
              <span className="font-bold">{dau ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Active Users</span>
              <span className="font-bold">{wau ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Active Users</span>
              <span className="font-bold">{mau ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Feature Adoption Rate</span>
              <span className="font-bold">—</span>
            </div>
            <div className="flex justify-between">
              <span>User Retention (7-day)</span>
              <span className="font-bold">—</span>
            </div>
            <div className="flex justify-between">
              <span>User Retention (30-day)</span>
              <span className="font-bold">—</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
