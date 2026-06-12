"use client";

import { useState, useEffect, useCallback, use } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplyOfferContent } from "./ApplyOfferContent";

interface ApplyPageProps {
  params: Promise<{ token: string }>;
}

function normalizeCampaign(campaign: any, root: any) {
  const c = Array.isArray(campaign) ? (campaign[0] ?? null) : campaign;
  if (!c || typeof c !== "object") return c;

  return {
    ...c,
    brief_pdf_url: c.brief_pdf_url ?? c.briefUrl ?? root?.brief_pdf_url ?? null,
    contract_pdf_url:
      c.contract_pdf_url ?? c.contractUrl ?? root?.contract_pdf_url ?? null,
  };
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const { token } = use(params);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [applicationNote, setApplicationNote] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [signedContractUrl, setSignedContractUrl] = useState<string | null>(null);
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [contractUploadError, setContractUploadError] = useState<string | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<
    "accept" | "decline" | "counter" | null
  >(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [viewingProductDetail, setViewingProductDetail] = useState<any>(null);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.fontSize;
    html.style.fontSize = "100%";
    return () => {
      html.style.fontSize = prev;
    };
  }, []);

  useEffect(() => {
    fetch(`/api/apply/${token}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          if (json.already_responded) {
            setSubmitted(true);
            setSubmittedAction(
              json.apply_status === "accepted"
                ? "accept"
                : json.apply_status === "declined"
                  ? "decline"
                  : "counter",
            );
          }
        }
      })
      .catch(() => setError("Failed to load application"))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleContractUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        setContractUploadError("Only PDF files are accepted");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setContractUploadError("File must be under 10MB");
        return;
      }

      setIsUploadingContract(true);
      setContractUploadError(null);

      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        const fileName = `contracts/${token}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("contracts")
          .upload(fileName, file, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          setContractUploadError("Upload failed: " + uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("contracts")
          .getPublicUrl(fileName);

        setSignedContractUrl(urlData.publicUrl);
      } catch {
        setContractUploadError("Upload failed. Please try again.");
      } finally {
        setIsUploadingContract(false);
      }
    },
    [token],
  );

  const toggleProduct = useCallback(
    (productId: string) => {
      const campaign = data?.campaigns;
      const maxCount = campaign?.max_product_count;

      setSelectedProductIds((prev) => {
        if (prev.includes(productId)) {
          return prev.filter((id) => id !== productId);
        }
        if (maxCount && prev.length >= maxCount) return prev;
        return [...prev, productId];
      });
    },
    [data],
  );

  const handleSubmit = useCallback(
    async (action: "accept" | "decline" | "counter") => {
      const campaign = data?.campaigns;

      if (
        action === "accept" &&
        campaign?.requires_contract &&
        !signedContractUrl
      ) {
        setSubmitError("Please upload your signed contract before accepting.");
        return;
      }

      if (
        action === "accept" &&
        campaign?.type === "paid_with_product" &&
        selectedProductIds.length === 0
      ) {
        setSubmitError("Please select at least one product.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const shippingData = (data as any)?.shipping_address_data
        const payload = {
          action,
          selected_product_ids: selectedProductIds,
          application_note: applicationNote || undefined,
          counter_offer_amount: counterAmount
            ? Math.round(parseFloat(counterAmount) * 100)
            : undefined,
          signed_contract_url: signedContractUrl ?? undefined,
          // Structured billing data — saved directly to influencers table
          shipping_address_structured: shippingData ? {
            first_name: shippingData.firstName ?? undefined,
            last_name: shippingData.lastName ?? undefined,
            phone: shippingData.phone ?? undefined,
            address_line1: shippingData.addressLine1 ?? undefined,
            address_line2: shippingData.addressLine2 ?? undefined,
            city: shippingData.city ?? undefined,
            state_province: shippingData.stateProvince ?? undefined,
            postal_code: shippingData.postalCode ?? undefined,
            country: shippingData.country ?? undefined,
          } : undefined,
        };

        const res = await fetch(`/api/apply/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setSubmitError(json.error ?? "Submission failed. Please try again.");
          return;
        }

        setSubmittedAction(action);
        setSubmitted(true);
      } catch {
        setSubmitError("Network error. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      token,
      data,
      selectedProductIds,
      applicationNote,
      counterAmount,
      signedContractUrl,
    ],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[#1a1aff]" />
          <p className="text-sm text-gray-400">Loading your offer...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link not found</h1>
          <p className="text-gray-500 text-sm">
            {error ?? "This application link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  const normalizedCampaign = normalizeCampaign(data.campaigns, data);
  const campaign = {
    ...normalizedCampaign,
    flat_amount:
      data.custom_flat_amount ?? normalizedCampaign?.flat_amount ?? null,
  };
  const influencer = data.influencers;
  const brand = campaign?.brands;
  const products = campaign?.campaign_products ?? [];
  const isPaidWithProduct = campaign?.type === "paid_with_product";

  const productsSorted = [...products].sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  const currentSelectionValue = selectedProductIds.reduce((sum, id) => {
    const p = products.find((x: any) => x.id === id);
    return sum + (p?.value ?? 0);
  }, 0);

  const maxProductValue = campaign?.max_product_value ?? null;

  if (submitted && submittedAction) {
    const config = {
      accept: {
        title: `Thank you, ${influencer?.first_name ?? "there"}!`,
        subtitle:
          "Your acceptance has been sent. The brand will be in touch soon.",
        color: "from-green-50 to-emerald-50",
      },
      decline: {
        title: `Thank you for your time, ${influencer?.first_name ?? "there"}!`,
        subtitle:
          "Your response has been recorded. We hope to work with you in the future.",
        color: "from-gray-50 to-slate-50",
      },
      counter: {
        title: `Counter-offer sent, ${influencer?.first_name ?? "there"}!`,
        subtitle:
          "Your counter-offer has been sent. The brand will review it and get back to you.",
        color: "from-[#eeeeff] to-[#e8e8ff]",
      },
    }[submittedAction];

    return (
      <div
        className={cn(
          "min-h-screen bg-linear-to-br flex items-center justify-center px-6",
          config.color,
        )}
      >
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-2xl font-black text-gray-900 mb-3">
              {config.title}
            </h1>
            <p className="text-gray-500 leading-relaxed">{config.subtitle}</p>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Powered by <span className="font-semibold text-[#2b2ef8]">Apfluence</span>
              </p>
            </div>
          </m.div>
        </LazyMotion>
      </div>
    );
  }

  return (
    <ApplyOfferContent
      influencer={influencer}
      brand={brand}
      campaign={campaign}
      products={products}
      productsSorted={productsSorted}
      isPaidWithProduct={isPaidWithProduct}
          selectedProductIds={selectedProductIds}
      applicationNote={applicationNote}
      counterAmount={counterAmount}
      signedContractUrl={signedContractUrl}
      isUploadingContract={isUploadingContract}
      contractUploadError={contractUploadError}
      isSubmitting={isSubmitting}
      submitError={submitError}
      showDeclineConfirm={showDeclineConfirm}
      isProductModalOpen={isProductModalOpen}
      showCounterInput={showCounterInput}
      viewingProductDetail={viewingProductDetail}
          maxProductValue={maxProductValue}
          currentSelectionValue={currentSelectionValue}
      onSetApplicationNote={setApplicationNote}
      onSetCounterAmount={setCounterAmount}
      onSetSignedContractUrl={setSignedContractUrl}
      onSetShowDeclineConfirm={setShowDeclineConfirm}
      onSetIsProductModalOpen={setIsProductModalOpen}
      onSetShowCounterInput={setShowCounterInput}
      onSetViewingProductDetail={setViewingProductDetail}
      onContractUpload={handleContractUpload}
      onToggleProduct={toggleProduct}
      onSubmit={handleSubmit}
    />
  );
}
