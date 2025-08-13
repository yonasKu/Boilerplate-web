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
import { useState } from "react";

// Demo reported content data
const reportedContent = [
  {
    id: "report_1",
    contentId: "content_123",
    contentType: "post",
    reporter: "John Doe",
    reporterEmail: "john@example.com",
    reportedUser: "Jane Smith",
    reportedUserEmail: "jane@example.com",
    reason: "Inappropriate content",
    status: "pending",
    reportedAt: "2025-08-12 14:30",
    contentPreview: "This is a sample post content that was reported...",
  },
  {
    id: "report_2",
    contentId: "content_456",
    contentType: "comment",
    reporter: "Robert Johnson",
    reporterEmail: "robert@example.com",
    reportedUser: "Emily Davis",
    reportedUserEmail: "emily@example.com",
    reason: "Harassment",
    status: "reviewed",
    reportedAt: "2025-08-11 09:15",
    contentPreview: "Harassing comment directed at another user...",
  },
  {
    id: "report_3",
    contentId: "content_789",
    contentType: "image",
    reporter: "Michael Wilson",
    reporterEmail: "michael@example.com",
    reportedUser: "Sarah Brown",
    reportedUserEmail: "sarah@example.com",
    reason: "Copyright infringement",
    status: "resolved",
    reportedAt: "2025-08-10 16:45",
    contentPreview: "Image that may violate copyright...",
  },
  {
    id: "report_4",
    contentId: "content_101",
    contentType: "post",
    reporter: "Lisa Miller",
    reporterEmail: "lisa@example.com",
    reportedUser: "Tom Anderson",
    reportedUserEmail: "tom@example.com",
    reason: "Spam",
    status: "pending",
    reportedAt: "2025-08-12 10:20",
    contentPreview: "Promotional post with suspicious links...",
  },
];

export default function ModerationPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const handleAction = (action: string, reportId: string) => {
    // In a real app, this would call an API to update the report status
    console.log(`Performing action "${action}" on report ${reportId}`);
  };
  
  const openReportDetails = (report: any) => {
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
              {reportedContent.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.contentId}</TableCell>
                  <TableCell>{report.contentType}</TableCell>
                  <TableCell>
                    <div>{report.reporter}</div>
                    <div className="text-sm text-muted-foreground">{report.reporterEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div>{report.reportedUser}</div>
                    <div className="text-sm text-muted-foreground">{report.reportedUserEmail}</div>
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        report.status === "pending" ? "default" : 
                        report.status === "reviewed" ? "secondary" : 
                        "outline"
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.reportedAt}</TableCell>
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
                                Are you sure you want to remove this {report.contentType}? This action cannot be undone.
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
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing 4 of 24 reported items
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
                <div className="col-span-3">{selectedReport.contentId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Type</label>
                <div className="col-span-3">{selectedReport.contentType}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reporter</label>
                <div className="col-span-3">
                  <div>{selectedReport.reporter}</div>
                  <div className="text-sm text-muted-foreground">{selectedReport.reporterEmail}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reported User</label>
                <div className="col-span-3">
                  <div>{selectedReport.reportedUser}</div>
                  <div className="text-sm text-muted-foreground">{selectedReport.reportedUserEmail}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reason</label>
                <div className="col-span-3">{selectedReport.reason}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Status</label>
                <div className="col-span-3">
                  <Badge 
                    variant={
                      selectedReport.status === "pending" ? "default" : 
                      selectedReport.status === "reviewed" ? "secondary" : 
                      "outline"
                    }
                  >
                    {selectedReport.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Reported At</label>
                <div className="col-span-3">{selectedReport.reportedAt}</div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <label className="text-right text-sm font-medium">Content Preview</label>
                <Textarea
                  className="col-span-3"
                  value={selectedReport.contentPreview}
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
