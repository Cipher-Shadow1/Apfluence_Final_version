import { notFound } from "next/navigation";

// Dev-only preview route that renders the real campaign detail UI.
// This lets you inspect the UI anytime without changing the production route.
import CampaignDetailPage from "@/app/(protected)/brand/campaigns/[id]/page";

export default function DevPreviewCampaignPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <CampaignDetailPage />;
}

