"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";

interface BanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: (banReason: string) => Promise<void>;
  isPending?: boolean;
}

export function BanDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isPending = false,
}: BanDialogProps) {
  const [banReason, setBanReason] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setBanReason("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!banReason.trim()) {
      return;
    }
    await onConfirm(banReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban <strong>{userName}</strong>? Please
            provide a reason for this action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="banReason">Ban Reason *</Label>
            <Textarea
              id="banReason"
              placeholder="Enter the reason for banning this user..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be stored and may be visible to the user.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !banReason.trim()}
          >
            {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
