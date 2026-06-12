"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Upload, Package, DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useWizard,
  type ProductDraft,
} from "@/components/brand/campaigns/wizard/CampaignWizardContext";
import { formatMoneyFromMajor } from "@/lib/money";
import { createBrandProduct, getBrandProducts } from "@/lib/queries/products";

export default function Step3Page() {
  const {
    campaignType,
    flatAmountUSD,
    setFlatAmountUSD,
    campaignCurrency,
    setCampaignCurrency,
    products,
    setProducts,
    showProductPrices,
    setShowProductPrices,
    optionalFlatUSD,
    setOptionalFlatUSD,
  } = useWizard();

  const [addingProduct, setAddingProduct] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<
    Array<{
      id: string;
      name: string;
      description: string | null;
      image_url: string | null;
      value: number;
    }>
  >([]);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogSelected, setCatalogSelected] = useState<Record<string, boolean>>(
    {},
  );
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [draftProduct, setDraftProduct] = useState<Omit<ProductDraft, "id">>({
    name: "",
    valueUSD: 0,
    description: "",
  });
  const productImgRef = useRef<HTMLInputElement>(null);

  const handleFilePreview = (file: File, setPreview: (s: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!uploadPreset || !cloudName) {
      throw new Error("Cloudinary environment variables are missing");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const json = await res.json();
    if (!res.ok || !json?.secure_url) {
      throw new Error(json?.error?.message || "Cloudinary upload failed");
    }
    return json.secure_url as string;
  };

  const addProduct = async () => {
    if (!draftProduct.name.trim()) return;
    const newDraft = { ...draftProduct, id: crypto.randomUUID() };
    setProducts((prev) => [...prev, newDraft]);
    setDraftProduct({ name: "", valueUSD: 0, description: "" });
    setAddingProduct(false);

    // Best-effort: persist into brand catalog for reuse
    try {
      const imageUrl = draftProduct.imageFile
        ? await uploadToCloudinary(draftProduct.imageFile)
        : null;
      const created = await createBrandProduct({
        name: draftProduct.name.trim(),
        description: draftProduct.description?.trim() || null,
        image_url: imageUrl,
        value: Math.round((draftProduct.valueUSD || 0) * 100),
      });
      if (created) {
        setCatalogProducts((prev) => [
          {
            id: created.id,
            name: created.name,
            description: created.description,
            image_url: created.image_url,
            value: created.value,
          },
          ...prev,
        ]);
      }
    } catch {
      // Catalog save should not block campaign creation.
    }
  };

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const totalProductsValue = products.reduce((s, p) => s + p.valueUSD, 0);

  useEffect(() => {
    if (campaignType !== "paid_with_product") return;
    setCatalogLoading(true);
    setCatalogError(null);
    void (async () => {
      try {
        const data = await getBrandProducts();
        setCatalogProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            image_url: p.image_url,
            value: p.value,
          })),
        );
      } catch {
        setCatalogError("Failed to load product catalog.");
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, [campaignType]);

  const filteredCatalog = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    if (!q) return catalogProducts;
    return catalogProducts.filter((p) =>
      `${p.name} ${p.description ?? ""}`.toLowerCase().includes(q),
    );
  }, [catalogProducts, catalogQuery]);

  const addSelectedFromCatalog = () => {
    const selected = Object.entries(catalogSelected)
      .filter(([, v]) => v)
      .map(([id]) => id);
    if (selected.length === 0) return;

    const selectedRows = catalogProducts.filter((p) => selected.includes(p.id));
    setProducts((prev) => {
      const next = [...prev];
      for (const p of selectedRows) {
        const exists = next.some(
          (x) =>
            x.name.trim().toLowerCase() === p.name.trim().toLowerCase() &&
            Math.round(x.valueUSD * 100) === p.value &&
            (x.imagePreview || "") === (p.image_url || ""),
        );
        if (exists) continue;
        next.push({
          id: crypto.randomUUID(),
          name: p.name,
          description: p.description ?? "",
          valueUSD: p.value / 100,
          imagePreview: p.image_url ?? undefined,
        });
      }
      return next;
    });

    setCatalogSelected({});
  };

  // Return a fallback if no type selected
  if (!campaignType) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center mx-auto max-w-sm">
        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
          <Package className="text-gray-300" size={24} />
        </div>
        <p className="text-[15px] font-bold text-gray-800 mb-2">
          No campaign type selected
        </p>
        <p className="text-[13px] text-gray-400">
          Please go back to Step 1 and choose a campaign type first to configure
          compensation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* ═════════ SECTION 1: COMPENSATION ═════════ */}
      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
        {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
        <div className="lg:w-[300px] shrink-0 w-full">
          <div className="sticky top-6">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
              Compensation
            </h2>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
              {campaignType === "paid"
                ? "Set the flat payment amount influencers will receive per collaboration."
                : "Add products to your catalog and configure product-related settings."}
            </p>
            <span
              className={cn(
                "inline-flex text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase",
                campaignType === "paid"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-blue-50 text-blue-600",
              )}
            >
              {campaignType === "paid" ? "Paid Only" : "Paid + Product"}
            </span>
          </div>
        </div>

        {/* ── RIGHT: FORM ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-7 space-y-8">
            {/* ── PAID ONLY ──────────────────────────────────── */}
            {campaignType === "paid" && (
              <div>
                <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                  Flat Payment
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Amount per creator ({campaignCurrency || "USD"})
                </p>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={flatAmountUSD}
                    onChange={(e) =>
                      setFlatAmountUSD(
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                      )
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                               outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/20 transition-all"
                  />
                  {typeof flatAmountUSD === "number" && (
                    <p className="text-[11px] text-gray-400">
                      Preview:{" "}
                      <span className="font-semibold text-gray-700">
                        {formatMoneyFromMajor(
                          flatAmountUSD,
                          campaignCurrency || "USD",
                        )}
                      </span>
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Fixed amount paid to each influencer in this campaign
                </p>
              </div>
            )}

            {/* ── PAID + PRODUCT ────────────────────────────────── */}
            {campaignType === "paid_with_product" && (
              <div>
                {/* Catalog picker */}
                <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">
                        Use previous products
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Pick from your saved product catalog and add to this campaign.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSelectedFromCatalog}
                      disabled={
                        Object.values(catalogSelected).filter(Boolean).length ===
                        0
                      }
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                        Object.values(catalogSelected).filter(Boolean).length > 0
                          ? "bg-[#1a1aff] text-white hover:bg-[#1a1aff]/90"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed",
                      )}
                    >
                      Add selected
                    </button>
                  </div>

                  <div className="mt-3">
                    <input
                      value={catalogQuery}
                      onChange={(e) => setCatalogQuery(e.target.value)}
                      placeholder="Search products…"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
                    />
                  </div>

                  {catalogError ? (
                    <p className="mt-3 text-xs font-medium text-red-500">
                      {catalogError}
                    </p>
                  ) : catalogLoading ? (
                    <p className="mt-3 text-xs text-gray-400">Loading catalog…</p>
                  ) : filteredCatalog.length === 0 ? (
                    <p className="mt-3 text-xs text-gray-400">
                      No saved products yet. Add one below to build your catalog.
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredCatalog.slice(0, 8).map((p) => {
                        const checked = Boolean(catalogSelected[p.id]);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              setCatalogSelected((prev) => ({
                                ...prev,
                                [p.id]: !checked,
                              }))
                            }
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                              checked
                                ? "border-[#1a1aff] bg-[#EEF2FF]"
                                : "border-gray-200 bg-white hover:bg-gray-50",
                            )}
                          >
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={16} className="text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-gray-800">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatMoneyFromMajor(
                                  p.value / 100,
                                  campaignCurrency || "USD",
                                )}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                      <Package size={14} className="text-[#1a1aff]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-800">
                        Products
                      </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {products.length} product
                      {products.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                  {!addingProduct && (
                    <button
                      type="button"
                      onClick={() => setAddingProduct(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF2FF] text-[#1a1aff] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors"
                    >
                      <Plus size={14} /> Add Product
                    </button>
                  )}
                </div>

                {addingProduct ? (
                  <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 space-y-4 mb-4">
                    <div className="flex gap-4">
                      {/* Img upload */}
                      <input
                        ref={productImgRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setDraftProduct((p) => ({ ...p, imageFile: f }));
                          handleFilePreview(f, (preview) =>
                            setDraftProduct((p) => ({
                              ...p,
                              imagePreview: preview,
                            })),
                          );
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => productImgRef.current?.click()}
                        className={cn(
                          "w-20 h-20 rounded-xl border border-gray-200 flex flex-col items-center justify-center bg-white hover:border-[#1a1aff] hover:bg-[#EEF2FF] transition-all overflow-hidden shrink-0 group",
                          draftProduct.imagePreview ? "border-transparent" : "",
                        )}
                      >
                        {draftProduct.imagePreview ? (
                          <img
                            src={draftProduct.imagePreview}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                        ) : (
                          <>
                            <Upload
                              size={14}
                              className="text-[#1a1aff]/40 group-hover:text-[#1a1aff] transition-colors"
                            />
                            <span className="text-[10px] text-[#1a1aff]/60 font-medium mt-1 leading-tight text-center px-1">
                              Upload
                              <br />
                              image
                            </span>
                          </>
                        )}
                      </button>
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={draftProduct.name}
                          onChange={(e) =>
                            setDraftProduct((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Product name *"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10 transition-all placeholder:text-gray-300"
                        />
                        <div className="w-full space-y-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={draftProduct.valueUSD || ""}
                            onChange={(e) =>
                              setDraftProduct((p) => ({
                                ...p,
                                valueUSD: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder={`Value (${campaignCurrency || "USD"})`}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10 transition-all placeholder:text-gray-300"
                          />
                          <p className="text-[11px] text-gray-400">
                            Preview:{" "}
                            <span className="font-semibold text-gray-700">
                              {formatMoneyFromMajor(
                                draftProduct.valueUSD || 0,
                                campaignCurrency || "USD",
                              )}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={draftProduct.description}
                      onChange={(e) =>
                        setDraftProduct((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Short description (optional)"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10 transition-all placeholder:text-gray-300"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingProduct(false);
                          setDraftProduct({
                            name: "",
                            valueUSD: 0,
                            description: "",
                          });
                        }}
                        className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                          onClick={() => void addProduct()}
                        disabled={!draftProduct.name.trim()}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors",
                          draftProduct.name.trim()
                            ? "bg-[#1a1aff] hover:bg-[#1a1aff]/90 shadow-sm"
                            : "bg-gray-200 cursor-not-allowed",
                        )}
                      >
                        Add product
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Products list items */}
                {products.length > 0 ? (
                  <div className="space-y-2">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm/0"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imagePreview ? (
                            <img
                              src={p.imagePreview}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          ) : (
                            <Package size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800 truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatMoneyFromMajor(
                              p.valueUSD,
                              campaignCurrency || "USD",
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2 pr-1">
                      <span className="text-xs font-semibold text-gray-500">
                        Total value:{" "}
                        <span className="text-gray-800">
                          {formatMoneyFromMajor(
                            totalProductsValue,
                            campaignCurrency || "USD",
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : !addingProduct ? (
                  <div className="flex flex-col items-center py-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <Package size={22} className="text-gray-300 mb-2" />
                    <p className="text-[13px] font-medium text-gray-500">
                      No products added yet
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═════════ SECTION 2: PRODUCT SETTINGS (ONLY IF PRODUCT) ═════════ */}
      {campaignType === "paid_with_product" && (
        <>
          <hr className="border-gray-100 max-w-[1350px] mx-auto" />

          <div className="flex flex-col lg:flex-row gap-10 w-full max-w-[1350px] mx-auto items-start">
            {/* ── LEFT: TITLE & DESCRIPTION ──────────────────────── */}
            <div className="lg:w-[300px] shrink-0 w-full">
              <div className="sticky top-6">
                <h2 className="text-[15px] font-bold text-gray-900 mb-1.5">
                  Product rules
                </h2>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Configure limits to control how much influencers can claim.
                  Set limits by max number of total items, or total dollar
                  value.
                </p>
              </div>
            </div>

            {/* ── RIGHT: FORM ────────────────────────────────────── */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-7 space-y-6">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                    Campaign currency
                  </label>
                  <input
                    type="text"
                    value={campaignCurrency}
                    onChange={(e) => setCampaignCurrency(e.target.value.toUpperCase())}
                    placeholder="DZD"
                    className="max-w-[240px] w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10"
                  />
                </div>

                {/* Show prices toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center shrink-0">
                      <DollarSign size={14} className="text-[#1a1aff]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">
                        Show product prices
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Influencers see prices on the application form
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={showProductPrices}
                    onCheckedChange={setShowProductPrices}
                    className="data-[state=checked]:bg-[#1a1aff]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Optional flat fee */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
                      Optional Flat Fee
                    </label>
                    <p className="text-[11px] text-gray-400 mb-2">
                      On top of products
                    </p>
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={optionalFlatUSD}
                        onChange={(e) =>
                          setOptionalFlatUSD(
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                          )
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/10 transition-all placeholder:text-gray-300"
                      />
                      {typeof optionalFlatUSD === "number" && (
                        <p className="text-[11px] text-gray-400">
                          Preview:{" "}
                          <span className="font-semibold text-gray-700">
                            {formatMoneyFromMajor(
                              optionalFlatUSD,
                              campaignCurrency || "USD",
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
