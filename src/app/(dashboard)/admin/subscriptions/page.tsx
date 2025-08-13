'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MoreHorizontal } from "lucide-react";

// Demo subscription data
const subscriptions = [
  {
    id: "sub_1",
    userId: "user_123",
    userName: "John Doe",
    userEmail: "john@example.com",
    plan: "Premium",
    status: "active",
    startDate: "2025-07-15",
    endDate: "2025-08-15",
    amount: "$9.99/month",
  },
  {
    id: "sub_2",
    userId: "user_456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    plan: "Free",
    status: "active",
    startDate: "2025-07-20",
    endDate: "Never",
    amount: "$0.00",
  },
  {
    id: "sub_3",
    userId: "user_789",
    userName: "Robert Johnson",
    userEmail: "robert@example.com",
    plan: "Premium",
    status: "expired",
    startDate: "2025-07-10",
    endDate: "2025-08-10",
    amount: "$9.99/month",
  },
  {
    id: "sub_4",
    userId: "user_101",
    userName: "Emily Davis",
    userEmail: "emily@example.com",
    plan: "Trial",
    status: "trialing",
    startDate: "2025-08-11",
    endDate: "2025-08-18",
    amount: "$0.00",
  },
  {
    id: "sub_5",
    userId: "user_202",
    userName: "Michael Wilson",
    userEmail: "michael@example.com",
    plan: "Premium",
    status: "canceled",
    startDate: "2025-07-01",
    endDate: "2025-08-01",
    amount: "$9.99/month",
  },
];

export default function SubscriptionManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <Button>Export Data</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Manage user subscriptions and payment plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Select>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">Filter</Button>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.userName}</TableCell>
                  <TableCell>{subscription.userEmail}</TableCell>
                  <TableCell>{subscription.plan}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        subscription.status === "active" ? "default" : 
                        subscription.status === "trialing" ? "secondary" : 
                        subscription.status === "expired" ? "outline" : 
                        "destructive"
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscription.startDate}</TableCell>
                  <TableCell>{subscription.endDate}</TableCell>
                  <TableCell>{subscription.amount}</TableCell>
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
                        <DropdownMenuItem>View subscription details</DropdownMenuItem>
                        <DropdownMenuItem>Extend subscription</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {subscription.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">Cancel subscription</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel {subscription.userName}'s {subscription.plan} subscription? 
                                  This will end their access to premium features at the end of their billing period.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Confirm Cancellation</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <DropdownMenuItem>Reactivate subscription</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Upgrade plan</DropdownMenuItem>
                        <DropdownMenuItem>Downgrade plan</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing 5 of 842 subscriptions
            </div>
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
