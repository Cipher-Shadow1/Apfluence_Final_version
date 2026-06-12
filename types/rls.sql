BEGIN;
-- ============================================================
-- 1) Ensure RLS is ON
-- ============================================================
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_content_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_smtp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_list_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
-- ============================================================
-- 2) Helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_brand_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT id
FROM public.brands
WHERE auth_user_id = auth.uid()
LIMIT 1 $$;
-- ============================================================
-- 3) brands policies (THIS fixes your error)
-- ============================================================
DROP POLICY IF EXISTS "brands: select own" ON public.brands;
DROP POLICY IF EXISTS "brands: insert own" ON public.brands;
DROP POLICY IF EXISTS "brands: update own" ON public.brands;
CREATE POLICY "brands: select own" ON public.brands FOR
SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "brands: insert own" ON public.brands FOR
INSERT TO authenticated WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "brands: update own" ON public.brands FOR
UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());
-- optional: only allow deleting your own row
DROP POLICY IF EXISTS "brands: delete own" ON public.brands;
CREATE POLICY "brands: delete own" ON public.brands FOR DELETE TO authenticated USING (auth_user_id = auth.uid());
-- ============================================================
-- 4) Brand-owned tables: allow INSERT + UPDATE (+SELECT/DELETE) for owner
-- ============================================================
DROP POLICY IF EXISTS "brand_settings: all own" ON public.brand_settings;
CREATE POLICY "brand_settings: all own" ON public.brand_settings FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_billing: all own" ON public.brand_billing;
CREATE POLICY "brand_billing: all own" ON public.brand_billing FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_shipping: all own" ON public.brand_shipping;
CREATE POLICY "brand_shipping: all own" ON public.brand_shipping FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_content_defaults: all own" ON public.brand_content_defaults;
CREATE POLICY "brand_content_defaults: all own" ON public.brand_content_defaults FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_smtp: all own" ON public.brand_smtp;
CREATE POLICY "brand_smtp: all own" ON public.brand_smtp FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_products: all own" ON public.brand_products;
CREATE POLICY "brand_products: all own" ON public.brand_products FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_lists: all own" ON public.brand_lists;
CREATE POLICY "brand_lists: all own" ON public.brand_lists FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "brand_list_influencers: all own" ON public.brand_list_influencers;
CREATE POLICY "brand_list_influencers: all own" ON public.brand_list_influencers FOR ALL TO authenticated USING (
    list_id IN (
        SELECT id
        FROM public.brand_lists
        WHERE brand_id = public.get_brand_id()
    )
) WITH CHECK (
    list_id IN (
        SELECT id
        FROM public.brand_lists
        WHERE brand_id = public.get_brand_id()
    )
);
DROP POLICY IF EXISTS "saved_influencers: all own" ON public.saved_influencers;
CREATE POLICY "saved_influencers: all own" ON public.saved_influencers FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
-- ============================================================
-- 5) Campaign owner policies (insert/update included)
-- ============================================================
DROP POLICY IF EXISTS "campaigns: all own" ON public.campaigns;
CREATE POLICY "campaigns: all own" ON public.campaigns FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "campaign_products: all own" ON public.campaign_products;
CREATE POLICY "campaign_products: all own" ON public.campaign_products FOR ALL TO authenticated USING (
    campaign_id IN (
        SELECT id
        FROM public.campaigns
        WHERE brand_id = public.get_brand_id()
    )
) WITH CHECK (
    campaign_id IN (
        SELECT id
        FROM public.campaigns
        WHERE brand_id = public.get_brand_id()
    )
);
DROP POLICY IF EXISTS "campaign_influencers: all own" ON public.campaign_influencers;
CREATE POLICY "campaign_influencers: all own" ON public.campaign_influencers FOR ALL TO authenticated USING (
    campaign_id IN (
        SELECT id
        FROM public.campaigns
        WHERE brand_id = public.get_brand_id()
    )
) WITH CHECK (
    campaign_id IN (
        SELECT id
        FROM public.campaigns
        WHERE brand_id = public.get_brand_id()
    )
);
DROP POLICY IF EXISTS "campaign_activity: all own" ON public.campaign_activity;
CREATE POLICY "campaign_activity: all own" ON public.campaign_activity FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
DROP POLICY IF EXISTS "matching_results: all own" ON public.matching_results;
CREATE POLICY "matching_results: all own" ON public.matching_results FOR ALL TO authenticated USING (
    campaign_id IN (
        SELECT id
        FROM public.campaigns
        WHERE brand_id = public.get_brand_id()
    )
) WITH CHECK (
    campaign_id IN (
        SELECT id
        FROM public.campaigns
        WHERE brand_id = public.get_brand_id()
    )
);
DROP POLICY IF EXISTS "collaboration_requests: brand own" ON public.collaboration_requests;
CREATE POLICY "collaboration_requests: brand own" ON public.collaboration_requests FOR ALL TO authenticated USING (brand_id = public.get_brand_id()) WITH CHECK (brand_id = public.get_brand_id());
COMMIT;

DROP POLICY IF EXISTS "brands: insert own" ON public.brands;
CREATE POLICY "brands: insert own" ON public.brands FOR
INSERT TO authenticated WITH CHECK (auth_user_id = auth.uid());
DROP POLICY IF EXISTS "brands: update own" ON public.brands;
CREATE POLICY "brands: update own" ON public.brands FOR
UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());
DROP POLICY IF EXISTS "brands: select own" ON public.brands;
CREATE POLICY "brands: select own" ON public.brands FOR
SELECT TO authenticated USING (auth_user_id = auth.uid());