"use client";

import { useState } from "react";
import { Copy, Link, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createInvite } from "@/lib/actions/friends";
import { toast } from "sonner";

export function InviteGenerator() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await createInvite();
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.code) {
      const url = `${window.location.origin}/invite/${result.code}`;
      setInviteUrl(url);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Invite link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite a Friend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inviteUrl ? (
          <div className="flex gap-2">
            <Input value={inviteUrl} readOnly className="text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerate} disabled={loading}>
            <Link className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Generate Invite Link"}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          Invite links expire after 7 days and can only be used once.
        </p>
      </CardContent>
    </Card>
  );
}
