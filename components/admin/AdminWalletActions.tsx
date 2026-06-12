"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

async function postJson(url: string, body: Record<string, any> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }
  return payload;
}

export function ApproveDepositButton({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await postJson(`/api/admin/wallet/deposits/${transactionId}/approve`);
              router.refresh();
            } catch (e: any) {
              setError(e?.message ?? "Failed");
            }
          });
        }}
      >
        {isPending ? "Approving..." : "Approve"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function DistributeCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await postJson(`/api/admin/wallet/campaigns/${campaignId}/distribute`);
              router.refresh();
            } catch (e: any) {
              setError(e?.message ?? "Failed");
            }
          });
        }}
      >
        {isPending ? "Processing..." : "Distribute"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function SendWithdrawalButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await postJson(`/api/admin/wallet/withdrawals/${requestId}/send`);
              router.refresh();
            } catch (e: any) {
              setError(e?.message ?? "Failed");
            }
          });
        }}
      >
        {isPending ? "Sending..." : "Mark Sent"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
