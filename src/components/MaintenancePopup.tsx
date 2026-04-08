"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export function MaintenancePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show after 5 seconds
    const openTimer = setTimeout(() => {
      // Check if it's already been shown in this session
      const hasBeenShown = sessionStorage.getItem("maintenancePopupShown");
      if (!hasBeenShown) {
        setIsOpen(true);
        sessionStorage.setItem("maintenancePopupShown", "true");
      }
    }, 5000);

    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    let closeTimer: NodeJS.Timeout;
    if (isOpen) {
      // Auto close after 10 seconds
      closeTimer = setTimeout(() => {
        setIsOpen(false);
      }, 10000);
    }
    return () => {
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] border-blue-200 bg-white dark:bg-slate-950 dark:border-blue-900">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Technical Improvements Notice
            </DialogTitle>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 text-left">
            <p>
              We are currently performing technical improvements on Repurposely to enhance performance and user experience.
            </p>
            <p>
              Some features may temporarily not work as expected or may experience minor bugs. Our team is actively working to resolve these issues as quickly as possible.
            </p>
            <p>
              We truly appreciate your patience and support. If you encounter any specific issue, please contact support and we will assist you promptly.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Thank you for your understanding 🙏
              </p>
              <p className="text-sm">
                — The Repurposely Team
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
