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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle } from "lucide-react";
import { useState } from "react";

// Demo promo code data
const promoCodes = [
  {
    id: "promo_1",
    code: "SAVE10",
    discountType: "percentage",
    discountValue: "10%",
    status: "active",
    usageCount: 42,
    maxUses: 100,
    expirationDate: "2025-12-31",
    description: "10% off for all users",
  },
  {
    id: "promo_2",
    code: "FREEMONTH",
    discountType: "fixed",
    discountValue: "1 month free",
    status: "active",
    usageCount: 18,
    maxUses: 50,
    expirationDate: "2025-11-15",
    description: "Free month for new subscribers",
  },
  {
    id: "promo_3",
    code: "WELCOME5",
    discountType: "percentage",
    discountValue: "5%",
    status: "expired",
    usageCount: 100,
    maxUses: 100,
    expirationDate: "2025-08-10",
    description: "5% off for new users",
  },
  {
    id: "promo_4",
    code: "REFERFRIEND",
    discountType: "fixed",
    discountValue: "$5.00",
    status: "active",
    usageCount: 76,
    maxUses: 200,
    expirationDate: "2026-01-31",
    description: "$5 off for users who refer friends",
  },
];

export default function PromoCodeManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promo Code Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
              <DialogDescription>
                Create a new promotional code for users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <Input
                  id="code"
                  placeholder="PROMO10"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountType" className="text-right">
                  Discount Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountValue" className="text-right">
                  Discount Value
                </Label>
                <Input
                  id="discountValue"
                  placeholder="10% or $5.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxUses" className="text-right">
                  Max Uses
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  placeholder="100"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiration" className="text-right">
                  Expiration Date
                </Label>
                <Input
                  id="expiration"
                  type="date"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description of the promo code"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={() => setIsCreateDialogOpen(false)}>
                Create Promo Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes</CardTitle>
          <CardDescription>Manage promotional codes and track their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promo codes..."
                className="pl-8"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell className="font-medium">{promoCode.code}</TableCell>
                  <TableCell>
                    {promoCode.discountType === "percentage" 
                      ? `${promoCode.discountValue} off` 
                      : `Get ${promoCode.discountValue}`}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        promoCode.status === "active" ? "default" : 
                        "destructive"
                      }
                    >
                      {promoCode.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promoCode.usageCount}/{promoCode.maxUses}
                  </TableCell>
                  <TableCell>{promoCode.expirationDate}</TableCell>
                  <TableCell>{promoCode.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Disable</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing 4 of 12 promo codes
            </div>
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
