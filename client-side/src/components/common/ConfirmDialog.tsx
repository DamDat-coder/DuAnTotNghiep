import React, { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Có",
  cancelText = "Không",
}: ConfirmDialogProps) {
  // Ngăn cuộn khi mở dialog
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // Cleanup khi unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl p-6 w-[350px] shadow-xl flex flex-col items-center gap-4">
        <div className="text-lg font-semibold text-center">{title}</div>
        {description && (
          <div className="text-sm text-gray-600 text-center">{description}</div>
        )}
        <div className="flex gap-3 mt-2">
          <button
            className="px-4 py-2 rounded bg-black text-white font-semibold hover:bg-gray-800"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-200 text-black font-semibold hover:bg-gray-300"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
