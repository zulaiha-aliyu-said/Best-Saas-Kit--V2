"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RepurposeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Repurpose page error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Repurpose page encountered an error. You can try again or go back to the dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/templates">View Templates</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
