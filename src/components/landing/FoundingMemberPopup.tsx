"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FoundingMemberPopupProps {
  remainingSpots: number;
}

const POPUP_DELAY_MS = 4000;

const FoundingMemberPopup = ({ remainingSpots }: FoundingMemberPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem("foundingMemberPopupShown");

    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("foundingMemberPopupShown", "true");
      }, POPUP_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => setIsOpen(false);

  const handleClaimOffer = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
    handleClose();
  };

  const bonuses = [
    "2X monthly credits for 3 months",
    "Priority support for 30 days",
    "Early access to new features",
    "Founding Member badge (#1–50)",
    "Access to the private Beta Testing Group",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className="p-0 border-none max-w-md w-full mx-auto rounded-2xl overflow-hidden"
            asChild
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[linear-gradient(to_bottom,#FF4D8A,#C043F5,#4C52FF)] text-white font-sans"
            >
              <div className="p-8 text-center relative">
                <DialogClose asChild>
                  <button onClick={handleClose} className="absolute top-4 right-4 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </DialogClose>
                <h2 className="text-4xl font-extrabold tracking-tight">
                  FOUNDING MEMBER BONUS
                </h2>
                <p className="mt-3 text-lg text-white/80">
                  A one-time opportunity for the first 50 buyers.
                </p>
              </div>

              <div className="px-8 pb-8">
                <ul className="space-y-3 text-left">
                  {bonuses.map((bonus, i) => (
                    <li key={i} className="flex items-center text-base">
                      <CheckCircle2 className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
                      <span>{bonus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-8 pb-8 text-center">
                <p className="font-semibold text-white/90 italic">
                  Only 50 spots — once they’re gone, they’re gone forever.
                </p>
                <p className="mt-4 text-yellow-300 font-semibold">
                  ⚠️ Limited Spots: {remainingSpots} left out of 50
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Act now to lock in your founding perks.
                </p>
              </div>

              <div className="px-8 pb-8">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Button
                    className="w-full h-14 bg-[linear-gradient(to_right,#FFC934,#FFB300)] hover:opacity-90 text-lg text-[#432C00] font-bold py-3 px-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
                    onClick={handleClaimOffer}
                  >
                    Claim Founding Member Spot
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default FoundingMemberPopup;
