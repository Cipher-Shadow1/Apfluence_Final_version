"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import {
  CheckCircle2,
  Upload,
  ExternalLink,
  Loader2,
  AlertCircle,
  Package,
  Eye,
  Trash2,
  Plus,
  DollarSign,
  LayoutGrid,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pdfPreviewEmbedSrc } from "@/lib/pdf-preview";
import ProductSelectionModal from "@/components/brand/apply/ProductSelectionModal";

function formatCents(cents: number | null): string {
  if (!cents) return "$0";
  if (cents >= 100000) return `$${(cents / 100).toLocaleString()}`;
  return `$${(cents / 100).toFixed(0)}`;
}

type ApplyOfferContentProps = {
  influencer: any;
  brand: any;
  campaign: any;
  products: any[];
  productsSorted: any[];
  isPaidWithProduct: boolean;
  selectedProductIds: string[];
  applicationNote: string;
  counterAmount: string;
  signedContractUrl: string | null;
  isUploadingContract: boolean;
  contractUploadError: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  showDeclineConfirm: boolean;
  isProductModalOpen: boolean;
  showCounterInput: boolean;
  viewingProductDetail: any;
  maxProductValue: number | null;
  currentSelectionValue: number;
  onSetApplicationNote: (v: string) => void;
  onSetCounterAmount: (v: string) => void;
  onSetSignedContractUrl: (v: string | null) => void;
  onSetShowDeclineConfirm: (v: boolean) => void;
  onSetIsProductModalOpen: (v: boolean) => void;
  onSetShowCounterInput: (v: boolean) => void;
  onSetViewingProductDetail: (v: any) => void;
  onContractUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onToggleProduct: (id: string) => void;
  onSubmit: (action: "accept" | "decline" | "counter") => Promise<void>;
};

export function ApplyOfferContent({
  influencer,
  brand,
  campaign,
  products,
  productsSorted,
  isPaidWithProduct,
  selectedProductIds,
  applicationNote,
  counterAmount,
  signedContractUrl,
  isUploadingContract,
  contractUploadError,
  isSubmitting,
  submitError,
  showDeclineConfirm,
  isProductModalOpen,
  showCounterInput,
  viewingProductDetail,
  maxProductValue,
  currentSelectionValue,
  onSetApplicationNote,
  onSetCounterAmount,
  onSetSignedContractUrl,
  onSetShowDeclineConfirm,
  onSetIsProductModalOpen,
  onSetShowCounterInput,
  onSetViewingProductDetail,
  onContractUpload,
  onToggleProduct,
  onSubmit,
}: ApplyOfferContentProps) {
  const briefPdfUrl = campaign?.brief_pdf_url ?? campaign?.briefUrl ?? null;
  const contractPdfUrl =
    campaign?.contract_pdf_url ?? campaign?.contractUrl ?? null;

  return (
    <LazyMotion features={domAnimation}>
      <>
        <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <img
              src="/logo blue gradient.svg"
              alt="Apfluence"
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-lg font-black text-[#2b2ef8] tracking-tight">
              Apfluence
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/sign-in/influencer"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Login
            </a>
            <a
              href="/sign-up/influencer"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2b2ef8] hover:bg-[#1a1ce8] transition-colors shadow-sm"
            >
              Sign up
            </a>
          </div>
        </header>

        <main className="min-h-screen bg-[#f8f8ff] pt-16 pb-24">
          <div className="md:max-w-8xl sm:max-w-7xl mx-auto px-6 py-8">
            <div className="animate-in fade-in duration-300">
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  {influencer?.avatar_url ? (
                    <img
                      src={influencer.avatar_url}
                      alt={influencer.name}
                      className="w-18 h-18 rounded-full object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-15 h-15 rounded-full bg-[#eeeeff] flex items-center justify-center">
                      <span className="text-xl font-bold text-[#2b2ef8]">
                        {influencer?.name?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h1 className="text-4xl font-black text-[#2b2ef8]">
                    Hi {influencer?.name ?? influencer?.first_name ?? "there"} !
                  </h1>
                </div>

                <p className="text-[#2b2ef8] font-semibold text-xl mb-2">
                  We would like to work with you.
                </p>

                <p className="text-gray-500 text-xl leading-relaxed">
                  You have received this invitation because{" "}
                  <span className="font-semibold text-gray-700">
                    {brand?.company_name ?? "a brand"}
                  </span>{" "}
                  would like to work with you! To make the collaboration process
                  easier, we use Apfluence — a platform that connects brands and
                  creators.
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100" />
              </section>

              <section className="mb-8">
                <h2 className="text-base font-semibold text-[#2b2ef8] mb-4">
                  Campaign Compensation
                </h2>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-linear-to-br from-[#7b2ff7] to-[#2b2ef8] text-white shadow-sm">
                      <DollarSign size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-1">Proposed payment</p>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        We would like to offer you the following payment for this
                        campaign. Please accept or share your counter offer with us
                        for review.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-3 rounded-xl border border-[#DCE4FF] bg-[#EEF2FF] px-4 py-2.5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#5963A7]">
                            Flat payment
                          </span>
                          <span className="text-lg font-black text-[#2b2ef8]">
                            {formatCents(campaign?.flat_amount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSetShowCounterInput(!showCounterInput)}
                          className={cn(
                            "px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                            showCounterInput
                              ? "bg-[#EEF2FF] text-[#2b2ef8] border border-[#DCE4FF]"
                              : "border border-gray-200 text-gray-700 hover:border-[#B7C6FF] hover:text-[#2b2ef8] hover:bg-[#F8F9FF]",
                          )}
                        >
                          {showCounterInput ? "Hide counter-offer" : "Make a counter-offer"}
                        </button>
                      </div>

                      {showCounterInput && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="relative flex-1 max-w-xs min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                              $
                            </span>
                            <input
                              type="number"
                              value={counterAmount}
                              onChange={(e) => onSetCounterAmount(e.target.value)}
                              placeholder="Enter your rate"
                              className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#d5d5fd]"
                            />
                          </div>
                          {counterAmount && parseFloat(counterAmount) > 0 && (
                            <button
                              type="button"
                              onClick={() => onSubmit("counter")}
                              disabled={isSubmitting}
                              className="px-4 py-2.5 rounded-xl bg-[#2b2ef8] text-white text-sm font-semibold hover:bg-[#1a1ce8] transition-colors disabled:opacity-50"
                            >
                              Send counter-offer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isPaidWithProduct && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-linear-to-br from-[#7b2ff7] to-[#2b2ef8] text-white shadow-sm">
                          <LayoutGrid size={20} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900">Choose your products</p>
                        </div>
                      </div>
                      {maxProductValue != null && (
                        <span className="text-sm font-semibold text-[#2b2ef8] shrink-0">
                          {formatCents(currentSelectionValue)}/
                          {formatCents(maxProductValue)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      We would like to offer you a choice of products as compensation.
                      Choose the one(s) you want to receive for this campaign.
                    </p>

                    {campaign?.max_product_count != null && (
                      <p className="text-xs text-gray-400 mb-3">
                        Max {campaign.max_product_count} item
                        {campaign.max_product_count !== 1 ? "s" : ""}
                        {selectedProductIds.length > 0
                          ? ` (${selectedProductIds.length} selected)`
                          : ""}
                      </p>
                    )}

                    {products.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                        <Package size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No products listed</p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-gray-100 divide-y divide-gray-50">
                          {selectedProductIds.map((id) => {
                            const product = products.find((p: any) => p.id === id);
                            if (!product) return null;
                            return (
                              <div key={id} className="flex items-center gap-3 py-2.5 px-1">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                  {product.image_url ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package size={16} className="text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatCents(product.value)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onSetViewingProductDetail(product)}
                                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onToggleProduct(id)}
                                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-400"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => onSetIsProductModalOpen(true)}
                          className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#2b2ef8] hover:text-[#2b2ef8] transition-all"
                        >
                          <Plus size={14} />
                          Add product
                        </button>
                      </>
                    )}
                  </div>
                )}
              </section>

              {(briefPdfUrl || campaign?.requires_contract || contractPdfUrl) && (
                <section className="mb-8">
                  {briefPdfUrl && (
                    <>
                      <h2 className="text-base font-semibold text-[#2b2ef8] mb-4">
                        Campaign Briefing
                      </h2>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <a
                          href={briefPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[#2b2ef8] hover:underline inline-flex items-center gap-1"
                        >
                          Click to open PDF
                          <ExternalLink size={14} />
                        </a>
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 h-200 bg-gray-50">
                          <embed
                            key={briefPdfUrl}
                            src={pdfPreviewEmbedSrc(briefPdfUrl)}
                            type="application/pdf"
                            title="Campaign Brief"
                            className="block h-full w-full min-h-64"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {(campaign?.requires_contract || contractPdfUrl) && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h3 className="text-base font-semibold text-[#2b2ef8] mb-4">
                        Contract
                      </h3>

                      {contractPdfUrl && (
                        <>
                          <a
                            href={contractPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-[#2b2ef8] hover:underline inline-flex items-center gap-1 mb-3"
                          >
                            Review Contract
                            <ExternalLink size={14} />
                          </a>
                          <div className="rounded-xl overflow-hidden border border-gray-200 h-200 mb-4 bg-gray-50">
                            <embed
                              key={contractPdfUrl}
                              src={pdfPreviewEmbedSrc(contractPdfUrl)}
                              type="application/pdf"
                              title="Contract PDF"
                              className="block h-full w-full min-h-64"
                            />
                          </div>
                        </>
                      )}

                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Upload Signed Contract <span className="text-red-400">*</span>
                      </p>

                      {signedContractUrl ? (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
                          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-700">
                              Contract uploaded successfully
                            </p>
                            <a
                              href={signedContractUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:underline"
                            >
                              View uploaded file
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSetSignedContractUrl(null)}
                            className="text-xs text-green-600 hover:text-green-800 underline shrink-0"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <label
                          className={cn(
                            "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200",
                            isUploadingContract
                              ? "border-[#a5a6fc] bg-[#eeeeff]"
                              : "border-gray-200 hover:border-[#a5a6fc] hover:bg-gray-50",
                          )}
                        >
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={onContractUpload}
                            disabled={isUploadingContract}
                          />
                          {isUploadingContract ? (
                            <div className="flex items-center gap-2 text-[#2b2ef8]">
                              <Loader2 size={18} className="animate-spin" />
                              <span className="text-sm font-medium">Uploading...</span>
                            </div>
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-700">
                                Click to upload signed contract
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PDF only • Max 10MB
                              </p>
                            </>
                          )}
                        </label>
                      )}

                      {contractUploadError && (
                        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {contractUploadError}
                        </p>
                      )}
                    </div>
                  )}
                </section>
              )}

              {!isPaidWithProduct && (
                <section className="mb-8">
                  <h2 className="text-base font-semibold text-[#2b2ef8] mb-4">
                    Your response
                  </h2>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message to {brand?.company_name ?? "brand"}
                    </label>
                    <textarea
                      value={applicationNote}
                      onChange={(e) => onSetApplicationNote(e.target.value)}
                      placeholder="Introduce yourself, ask questions, share your ideas..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all resize-none placeholder:text-gray-300 focus:border-[#5254f9] focus:ring-2 focus:ring-[#d5d5fd]"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {applicationNote.length}/500
                    </p>
                  </div>
                </section>
              )}

              {submitError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 mb-6">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <p className="text-center text-xs text-gray-400 pt-2">
                This offer was sent via{" "}
                <span className="font-semibold text-[#2b2ef8]">Apfluence</span>
              </p>
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-gray-100 flex items-center justify-center gap-4 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={() => onSetShowDeclineConfirm(true)}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
          >
            Refuse
          </button>

          <button
            type="button"
            onClick={() => onSubmit("accept")}
            disabled={
              isSubmitting ||
              (isPaidWithProduct && selectedProductIds.length === 0) ||
              (campaign?.requires_contract && !signedContractUrl)
            }
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center gap-2",
              isSubmitting ||
                (isPaidWithProduct && selectedProductIds.length === 0) ||
                (campaign?.requires_contract && !signedContractUrl)
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#2b2ef8] hover:bg-[#1a1ce8] shadow-sm hover:shadow-md",
            )}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Accept offer"
            )}
          </button>
        </footer>

        <ProductSelectionModal
          key={isProductModalOpen ? "product-modal-open" : "product-modal-closed"}
          isOpen={isProductModalOpen}
          onClose={() => onSetIsProductModalOpen(false)}
          products={productsSorted}
          selectedProductIds={selectedProductIds}
          onSaveSelection={(id) => {
            if (!selectedProductIds.includes(id)) onToggleProduct(id);
            onSetIsProductModalOpen(false);
          }}
          maxProductValue={maxProductValue}
          maxProductCount={campaign?.max_product_count ?? null}
          currentSelectionValue={currentSelectionValue}
        />

        {showDeclineConfirm && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => onSetShowDeclineConfirm(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Decline this offer?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to decline? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onSetShowDeclineConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubmit("decline")}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Yes, Decline"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {viewingProductDetail && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
              onClick={() => onSetViewingProductDetail(null)}
            />
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
              <div
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Product details</h2>
                  <button
                    type="button"
                    onClick={() => onSetViewingProductDetail(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex gap-6">
                    <div className="w-52 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-40">
                      {viewingProductDetail.image_url ? (
                        <img
                          src={viewingProductDetail.image_url}
                          alt={viewingProductDetail.name}
                          className="w-full h-full object-contain max-h-48"
                        />
                      ) : (
                        <Package size={40} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">
                        {viewingProductDetail.name}
                      </h3>
                      <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 mb-3">
                        <span className="text-sm font-bold text-gray-800">
                          {formatCents(viewingProductDetail.value)}
                          {maxProductValue != null && (
                            <span className="text-gray-500 font-normal">
                              /{formatCents(maxProductValue)}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        This product has no option
                      </p>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Gift value
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatCents(viewingProductDetail.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSetViewingProductDetail(null)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    </LazyMotion>
  );
}
