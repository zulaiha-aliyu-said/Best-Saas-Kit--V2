"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    X,
    Sparkles,
    Zap,
    Gift,
    Users,
    Star,
    Crown
} from "lucide-react";

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

    const features = [
        { icon: Gift, text: "2X monthly credits for 3 months", color: "text-purple-400" },
        { icon: Zap, text: "Priority support for 30 days", color: "text-yellow-400" },
        { icon: Star, text: "Early access to new features", color: "text-pink-400" },
        { icon: Crown, text: "Founding Member badge (#1–50)", color: "text-amber-400" },
        { icon: Users, text: "Access to the private Beta Testing Group", color: "text-blue-400" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-sm sm:max-w-lg w-full mx-auto p-0 overflow-hidden border-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 p-6 sm:p-8 text-white">
                    {/* Close Button - More visible and easier to click */}
                    <DialogClose asChild>
                        <button
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group z-50"
                            aria-label="Close popup"
                        >
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </DialogClose>

                    {/* Hidden title for accessibility */}
                    <DialogTitle className="sr-only">Founding Member Exclusive Offer</DialogTitle>

                    {/* Header with Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 animate-bounce">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div className="inline-flex items-center gap-2 mb-3 flex-wrap justify-center">
                            <span className="text-sm font-semibold px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full animate-pulse">
                                🎉 FOUNDING MEMBER
                            </span>
                            <span className="text-sm font-semibold px-3 py-1 bg-yellow-500/30 backdrop-blur-sm rounded-full">
                                ⏰ LIMITED TIME
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                            Exclusive Launch Offer 🚀
                        </h2>
                        <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                            Join our <span className="font-bold text-yellow-300">founding members</span> and unlock premium perks that will never be available again!
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-3 mb-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                                    style={{
                                        animation: `slideInLeft 0.5s ease-out ${index * 100}ms backwards`
                                    }}
                                >
                                    <div className={`p-2 ${feature.color} bg-white/10 rounded-lg flex-shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-white font-medium text-sm pt-1 sm:pt-2">{feature.text}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Urgency Section */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/80">Spots Remaining</span>
                            <span className="text-2xl font-bold text-yellow-300 animate-pulse">
                                {remainingSpots}/50
                            </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                                style={{
                                    width: `${(remainingSpots / 50) * 100}%`,
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}
                            ></div>
                        </div>
                        <p className="text-xs text-white/70 text-center mt-2">
                            ⚡ Once they're gone, they're gone forever!
                        </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                        className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 sm:py-4 px-6 rounded-xl text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                        onClick={() => {
                            const pricingSection = document.getElementById("pricing");
                            if (pricingSection) {
                                pricingSection.scrollIntoView({ behavior: "smooth" });
                            }
                            setIsOpen(false);
                        }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Claim My Founding Member Spot
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </span>
                    </Button>
                </div>

                {/* Custom CSS for animations */}
                <style jsx>{`
                    @keyframes slideInLeft {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
};

export default FoundingMemberPopup;