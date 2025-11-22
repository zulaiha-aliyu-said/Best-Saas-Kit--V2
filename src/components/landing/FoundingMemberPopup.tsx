"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FoundingMemberPopupProps {
  remainingSpots: number;
}

const FoundingMemberPopup = ({ remainingSpots }: FoundingMemberPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem("foundingMemberPopupShown");

    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("foundingMemberPopupShown", "true");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            FOUNDING MEMBER BONUS
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            This is a one-time offer for the first 50 buyers.
          </p>
        </div>
        <div className="mt-6">
          <ul className="space-y-4 text-gray-700 dark:text-gray-200">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✔</span>
              <span>2X monthly credits for 3 months</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✔</span>
              <span>Priority support for 30 days</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✔</span>
              <span>Early access to new features</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✔</span>
              <span>Founding Member badge (#1–50)</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✔</span>
              <span>Access to the private Beta Testing Group</span>
            </li>
          </ul>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Only 50 spots — once they’re gone, they’re gone forever.
          </p>
          <p className="mt-2 text-yellow-500 font-semibold">
            ⚠️ Limited Spots: {remainingSpots} left out of 50
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Act now to lock in your founding perks.
          </p>
        </div>
        <div className="mt-6">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg"
            onClick={() => {
              const pricingSection = document.getElementById("pricing");
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" });
              }
              setIsOpen(false);
            }}
          >
            Claim Founding Member Spot
          </Button>
        </div>
        <DialogClose asChild>
          <button className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default FoundingMemberPopup;