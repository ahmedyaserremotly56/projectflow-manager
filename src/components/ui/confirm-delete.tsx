"use client";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "./dialog";

interface ConfirmDeleteProps {
  title?: string;
  description?: string;
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConfirmDelete({
  title = "تأكيد الحذف",
  description = "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  open, onConfirm, onCancel,
}: ConfirmDeleteProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="sm:max-w-sm" dir="rtl">
        <DialogHeader>
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 flex-row justify-center">
          <Button variant="outline" onClick={onCancel} className="rounded-xl flex-1">إلغاء</Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl flex-1 gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
