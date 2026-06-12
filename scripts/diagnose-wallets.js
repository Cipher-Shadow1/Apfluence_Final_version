// Diagnostic: check wallet state for influencers
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  console.log("\n=== ALL WALLETS ===");
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .order("created_at", { ascending: false });
  console.table(wallets);

  console.log("\n=== CAMPAIGN PAYOUTS ===");
  const { data: payouts } = await supabase
    .from("campaign_payouts")
    .select("id, campaign_id, influencer_id, amount, status, payout_transaction_id, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  console.table(payouts);

  console.log("\n=== RECENT TRANSACTIONS ===");
  const { data: txns } = await supabase
    .from("transactions")
    .select("id, type, status, amount, from_wallet_id, to_wallet_id, campaign_id, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  console.table(txns);

  // Check if any influencer wallet exists
  console.log("\n=== INFLUENCER WALLETS ===");
  const { data: infWallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("owner_type", "influencer");
  console.table(infWallets);
}

diagnose().catch(console.error);
