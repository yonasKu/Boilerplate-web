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
import { useEffect, useMemo, useState } from "react";
import { adminCreatePromoCode, adminDisablePromoCode } from "@/lib/adminApi";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type PromoDoc = {
  id: string;
  code: string;
  type?: 'promo' | 'gift';
  compDays?: number;
  isActive?: boolean;
  maxUses?: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
};

export default function PromoCodeManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [disablingCode, setDisablingCode] = useState<string | null>(null);
  const [items, setItems] = useState<PromoDoc[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows: PromoDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return items;
    return items.filter((p) => p.code?.toUpperCase().includes(term));
  }, [items, search]);

  async function handleCreate() {
    try {
      setCreating(true);
      const code = newCode.trim() || undefined;
      await adminCreatePromoCode({ code });
      alert("Promo code created");
      setIsCreateDialogOpen(false);
      setNewCode("");
    } catch (e: any) {
      alert(e?.message || "Failed to create promo code");
    } finally {
      setCreating(false);
    }
  }

  async function handleDisable(code: string) {
    try {
      setDisablingCode(code);
      await adminDisablePromoCode(code);
      alert("Promo code disabled");
    } catch (e: any) {
      alert(e?.message || "Failed to disable promo code");
    } finally {
      setDisablingCode(null);
    }
  }
  
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
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
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
              <Button type="button" disabled={creating} onClick={handleCreate}>
                {creating ? "Creating..." : "Create Promo Code"}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Comp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Max Uses</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const expired = p.validUntil ? p.validUntil.toDate() < new Date() : false;
                const status = expired ? 'expired' : (p.isActive ? 'active' : 'inactive');
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.code}</TableCell>
                    <TableCell>{p.type || 'promo'}</TableCell>
                    <TableCell>{p.compDays ? `${p.compDays} days` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={status === 'active' ? 'default' : status === 'expired' ? 'destructive' : 'secondary'}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.maxUses ?? '-'}</TableCell>
                    <TableCell>{p.validUntil ? p.validUntil.toDate().toISOString().slice(0, 10) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={disablingCode === p.code}
                        onClick={() => handleDisable(p.code)}
                      >
                        {disablingCode === p.code ? "Disabling..." : "Disable"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
