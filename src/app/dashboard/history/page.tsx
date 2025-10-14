"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HistoryPage(){
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History & Saved Generations</h1>
        <p className="text-muted-foreground">Reuse or tweak previous outputs</p>
      </div>

      <Card className="card-soft-shadow">
        <CardHeader>
          <CardTitle>Past Posts</CardTitle>
          <CardDescription>Filter by platform, tone, or date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-xl border p-4">
                <div className="mb-2 text-xs text-muted-foreground">{p.platform?.toUpperCase()} • Draft</div>
                <p className="text-sm line-clamp-3 whitespace-pre-wrap">{p.body}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => navigator.clipboard.writeText(p.body)}>Copy</Button>
                  <Button size="sm" variant="outline">Regenerate</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const blob = new Blob([p.body], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'post.txt'; a.click(); URL.revokeObjectURL(url);
                  }}>Export .txt</Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-sm text-muted-foreground">No saved posts yet. Generate something on the Repurpose page.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
