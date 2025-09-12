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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { adminModerationAction, type AdminModerationAction } from "@/lib/adminApi";

type ReportDoc = {
  id: string;
  contentId?: string;
  contentType?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterUserId?: string;
  reportedUserName?: string;
  reportedUserEmail?: string;
  reportedUserId?: string;
  reason?: string;
  status?: string;
  reportedAt?: Timestamp;
  createdAt?: Timestamp;
  contentPreview?: string;
};

export default function ModerationPage() {
  const [items, setItems] = useState<ReportDoc[]>([]);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportDoc | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const rows: ReportDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((r) => {
      const contentId = (r.contentId || '').toLowerCase();
      const reporter = (r.reporterName || (r as any).reporter || '').toLowerCase();
      const reporterEmail = (r.reporterEmail || '').toLowerCase();
      const reportedUser = (r.reportedUserName || (r as any).reportedUser || '').toLowerCase();
      const reportedEmail = (r.reportedUserEmail || '').toLowerCase();
      const reason = (r.reason || '').toLowerCase();
      return (
        contentId.includes(term) ||
        reporter.includes(term) ||
        reporterEmail.includes(term) ||
        reportedUser.includes(term) ||
        reportedEmail.includes(term) ||
        reason.includes(term)
      );
    });
  }, [items, search]);

  const handleAction = async (action: AdminModerationAction, reportId: string) => {
    if (pendingAction) return;
    const key = `${action}:${reportId}`;
    setPendingAction(key);
    try {
      await adminModerationAction({ reportId, action });
      // Firestore listener will reflect updates; provide minimal feedback
      if (typeof window !== 'undefined') {
        alert(`Action \"${action}\" applied to report ${reportId}`);
      }
    } catch (e: any) {
      const msg = e?.message || 'Action failed';
      if (typeof window !== 'undefined') {
        alert(msg);
      }
      console.error('adminModerationAction error', e);
    } finally {
      setPendingAction(null);
    }
  };

  const openReportDetails = (report: ReportDoc) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <Button>Export Reports</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reported Content</CardTitle>
          <CardDescription>Review and manage content reported by users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((report) => {
                const contentId = report.contentId || '—';
                const contentType = report.contentType || 'post';
                const reporter = report.reporterName || (report as any).reporter || '—';
                const reporterEmail = report.reporterEmail || '—';
                const reportedUser = report.reportedUserName || (report as any).reportedUser || '—';
                const reportedUserEmail = report.reportedUserEmail || '—';
                const reason = report.reason || '—';
                const status = report.status || 'pending';
                const reportedAt = (report.reportedAt || report.createdAt) ? (report.reportedAt || report.createdAt)!.toDate().toISOString().replace('T', ' ').slice(0,16) : '—';
                return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{contentId}</TableCell>
                  <TableCell>{contentType}</TableCell>
                  <TableCell>
                    <div>{reporter}</div>
                    <div className="text-sm text-muted-foreground">{reporterEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div>{reportedUser}</div>
                    <div className="text-sm text-muted-foreground">{reportedUserEmail}</div>
                  </TableCell>
                  <TableCell>{reason}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        status === "pending" ? "default" : 
                        status === "reviewed" ? "secondary" : 
                        "outline"
                      }
                    >
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>{reportedAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openReportDetails(report)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction("approve", report.id)}>
                          Approve content
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              Remove content
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Content</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this {contentType}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleAction("remove", report.id)}
                              >
                                Remove Content
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <DropdownMenuItem onClick={() => handleAction("ban-user", report.id)}>
                          Ban user
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction("mark-reviewed", report.id)}>
                          Mark as reviewed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("mark-resolved", report.id)}>
                          Mark as resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filtered.length} of {items.length} reported items
            </div>
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Content ID</label>
                <div className="col-span-3">{selectedReport.contentId || '—'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Type</label>
                <div className="col-span-3">{selectedReport.contentType || 'post'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reporter</label>
                <div className="col-span-3">
                  <div>{selectedReport.reporterName || (selectedReport as any).reporter || '—'}</div>
                  <div className="text-sm text-muted-foreground">{selectedReport.reporterEmail || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reported User</label>
                <div className="col-span-3">
                  <div>{selectedReport.reportedUserName || (selectedReport as any).reportedUser || '—'}</div>
                  <div className="text-sm text-muted-foreground">{selectedReport.reportedUserEmail || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reason</label>
                <div className="col-span-3">{selectedReport.reason || '—'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Status</label>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      (selectedReport.status || 'pending') === "pending" ? "default" : 
                      (selectedReport.status || 'pending') === "reviewed" ? "secondary" : 
                      "outline"
                    }
                  >
                    {selectedReport.status || 'pending'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reported At</label>
                <div className="col-span-3">{(selectedReport.reportedAt || selectedReport.createdAt) ? (selectedReport.reportedAt || selectedReport.createdAt)!.toDate().toISOString().replace('T', ' ').slice(0,16) : '—'}</div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <label className="text-right text-sm font-medium">Content Preview</label>
                <Textarea
                  className="col-span-3"
                  value={selectedReport.contentPreview || ''}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <label className="text-right text-sm font-medium">Moderator Notes</label>
                <Textarea
                  className="col-span-3"
                  placeholder="Add notes about your review..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
