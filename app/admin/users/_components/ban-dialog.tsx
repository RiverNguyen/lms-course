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
          <DialogTitle>Khóa Người dùng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn khóa <strong>{userName}</strong>? Vui lòng
            cung cấp lý do cho hành động này.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="banReason">Lý do khóa *</Label>
            <Textarea
              id="banReason"
              placeholder="Nhập lý do khóa người dùng này..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Lý do này sẽ được lưu và có thể hiển thị cho người dùng.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !banReason.trim()}
          >
            {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Khóa Người dùng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
