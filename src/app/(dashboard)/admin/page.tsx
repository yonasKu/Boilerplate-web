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
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, CreditCard, DollarSign, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getCountFromServer, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activeSubs, setActiveSubs] = useState<number | null>(null);
  const [dau, setDau] = useState<number | null>(null);

  const [growthData, setGrowthData] = useState<{ name: string; users: number }[]>([]);
  const [recentUsers, setRecentUsers] = useState<{
    id: string;
    name: string;
    email: string;
    plan: string;
  }[]>([]);

  // Growth chart (last 6 days signups)
  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 5);
    from.setHours(0, 0, 0, 0);
    const qUsers = query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(from)),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(qUsers, (snap) => {
      const byDay = new Map<string, number>();
      for (let i = 0; i < 6; i++) {
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
      const arr = Array.from(byDay.entries()).map(([date, users]) => ({ name: date, users }));
      setGrowthData(arr);
    });
    return () => unsub();
  }, []);

  // KPIs
  useEffect(() => {
    const run = async () => {
      try {
        const usersColl = collection(db, 'users');
        const total = await getCountFromServer(usersColl);
        setTotalUsers(total.data().count);

        const active = await getCountFromServer(query(usersColl, where('subscription.status', '==', 'active')));
        setActiveSubs(active.data().count);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const dauSnap = await getCountFromServer(query(usersColl, where('lastActiveAt', '>=', Timestamp.fromDate(startOfDay))));
        setDau(dauSnap.data().count);
      } catch (e) {
        console.error('Failed to load dashboard KPIs', e);
      }
    };
    run();
  }, []);

  // Recent signups (live)
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as any;
        const plan = data?.subscription?.plan ?? (data?.subscription?.status === 'active' ? 'Premium' : 'Free');
        return {
          id: d.id,
          name: data?.name || data?.displayName || 'Unknown',
          email: data?.email || '—',
          plan: plan || '—',
        };
      });
      setRecentUsers(rows);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Generate Report</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Live</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubs ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Users with active plan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Coming from billing backend</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dau ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Active today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#1d4ed8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>The latest users to join the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.plan === 'Premium' ? 'default' : 'secondary'}>{user.plan}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
