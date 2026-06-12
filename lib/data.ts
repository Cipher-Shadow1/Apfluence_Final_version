// export type MockPost = {
//   id: string;
//   platform: "instagram" | "tiktok" | "youtube" | "x";
//   thumbnailUrl: string;
//   caption: string;
//   likes: number;
//   comments: number;
//   views?: number;
//   shares?: number;
//   estimatedImpressions?: string;
//   estimatedReach?: string;
//   engagementRate: string;
//   cpe?: string;
//   postedAt: string;
// };

// /**
//  * @deprecated
//  * This file is no longer the source of truth.
//  * All data is now fetched from Supabase via lib/queries/influencers.ts
//  * This file is kept temporarily as a reference.
//  * Safe to delete after confirming all consumers are migrated.
//  */
// export interface Influencer {
//   id: string;
//   name: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   location: {
//     city: string;
//     countryCode: string;
//     flag?: string;
//   };
//   avatar: string;
//   bio: string;
//   gallery: string[];
//   authenticityScore: number;
//   niches: string[];
//   categories: string[];
//   metrics: {
//     platform: "instagram" | "tiktok" | "youtube" | "x";
//     handle: string;
//     followers: string;
//     engagement: string;
//     avgLikes: string;
//     avgComments: string;
//     avgShares?: string;
//     avgViews?: string;
//     estimatedPriceRange?: string;
//     cpe?: string;
//     cpv?: string;
//   }[];
//   posts?: MockPost[];
// }

// type RawMetric = {
//   platform: "instagram" | "tiktok" | "youtube" | "x";
//   value?: string;
//   followers?: string;
//   handle?: string;
//   engagement: string;
//   avgLikes?: string;
//   avgComments?: string;
//   avgShares?: string;
//   avgViews?: string;
//   estimatedPriceRange?: string;
//   cpe?: string;
//   cpv?: string;
// };

// type RawInfluencer = Omit<
//   Influencer,
//   "metrics" | "location" | "firstName" | "lastName" | "email" | "niches"
// > & {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   niches?: string[];
//   location: {
//     city: string;
//     countryCode: string;
//     flag?: string;
//   };
//   metrics: RawMetric[];
//   posts?: MockPost[];
// };

// /** Realistic Unsplash crop URLs — varied subjects for thumbnails */
// const US = (slug: string) =>
//   `https://images.unsplash.com/photo-${slug}?q=80&w=480&h=640&fit=crop&auto=format`;

// const PHOTO_ROTATION: string[] = [
//   "1517649763962-0c623066013b",
//   "1550090544-db57b98028af",
//   "1579952363873-27f3bade9f55",
//   "1515886657613-9f3515b0c78f",
//   "1550614000-4b9cedc3bc86",
//   "1593640408182-31c70c8268f5",
//   "1542831371-29b0f74f9713",
//   "1473093295043-cdd812d0e601",
//   "1551183053-bf91a1d81141",
//   "1469474968028-56623f02e42e",
//   "1534438327276-14e5300c3a48",
//   "1542751371-adc38448a05e",
//   "1512496015851-a1c848fe718e",
//   "1611974789855-9c2a0a7236a3",
//   "1618005182384-a83a8bd57fbe",
//   "1581092160562-40aa08e78837",
//   "1514989940723-e8e51635b782",
//   "1498837167922-ddd27525d352",
//   "1541364983171-a8ba01e95cb2",
//   "1502086223501-7ea6ecd79368",
//   "1543466835-00a7907e9de1",
//   "1516035069371-29a1b244cc32",
//   "1555066931-4365d14bab8c",
//   "1600596542815-ffad4c1539a9",
//   "1470229722913-7c0e2dbbafd3",
//   "1506794778202-cad84cf45f1d",
//   "1524504388940-b1c1722653e1",
//   "1560250097-0b93528c311a",
//   "1488161628813-04466f872507",
//   "1531746020798-e6953c6e8e04",
//   "1622253692010-333f2da6031d",
//   "1540569014015-19a7be504e3a",
//   "1511895426328-dc8714191300",
//   "1517841905240-472988babdf9",
//   "1554151228-14d9def656e4",
//   "1573496359142-b8d87734a5a2",
//   "1560520653-9e0e4c89eb11",
//   "1514525253161-7a46d19cd819",
// ];

// const POSTED_AT: readonly string[] = [
//   "2 days ago",
//   "a week ago",
//   "24 days ago",
//   "a month ago",
// ];

// /** 4 captions per platform per influencer (niche-matched) */
// const CAPTIONS: Record<
//   string,
//   Partial<
//     Record<
//       "instagram" | "tiktok" | "youtube" | "x",
//       [string, string, string, string]
//     >
//   >
// > = {
//   "1": {
//     instagram: [
//       "Thursday night lights — full highlights on YT 🏈",
//       "Route tree reps before season opener",
//       "Locker room fit check",
//       "Camp vibes with the squad",
//     ],
//     tiktok: [
//       "POV: you finally score in overtime",
//       "GRWM: game day edition",
//       "Trending sound but make it football",
//       "When coach says one more sprint",
//     ],
//     youtube: [
//       "Week 8 film study — every route explained",
//       "Subscriber Q&A: NIL & training schedule",
//       "Mini doc: day in the life of a D1 receiver",
//       "Equipment haul & glove review",
//     ],
//   },
//   "2": {
//     instagram: [
//       "Slow fashion haul: linen & low waste",
//       "Outfit formula: one coat, three ways",
//       "Sunday market in Notting Hill",
//       "Tailoring detail that changed my fits",
//     ],
//     tiktok: [
//       "Get ready with me: sustainable capsule",
//       "Thrift flip in 60 seconds",
//       "POV: your coat is actually vintage",
//       "Styling one scarf five ways",
//     ],
//   },
//   "3": {
//     youtube: [
//       "I built a split keyboard from scratch",
//       "Honest review: flagship phone cameras",
//       "Desk setup tour 2026",
//       "Teardown: what's inside this budget laptop?",
//     ],
//     instagram: [
//       "New keycaps, new serotonin",
//       "Macro shot: soldering under the microscope",
//       "Minimal desk, maximal FPS",
//       "Coffee first, commits later",
//     ],
//     x: [
//       "Hot take: tactile > linear for typing marathons",
//       "Shipping a firmware patch tonight — wish me luck",
//       "Bookmark: my favorite soldering tips thread 🧵",
//       "Poll: next teardown should be…",
//     ],
//   },
//   "4": {
//     instagram: [
//       "Nonna's carbonara — no cream, only love",
//       "Sunday gravy simmering all afternoon",
//       "Farmers market haul → pasta night",
//       "Homemade focaccia golden hour",
//     ],
//     tiktok: [
//       "ASMR: rolling fresh pappardelle",
//       "3-ingredient tiramisu (trust)",
//       "When the parmesan hits the pasta water",
//       "Tiny kitchen, big flavors",
//     ],
//     youtube: [
//       "Masterclass: fresh egg dough step by step",
//       "Regional pasta tour of Italy (part 1)",
//       "Budget weeknight meals under $10",
//       "Cook-along live replay: cacio e pepe",
//     ],
//   },
//   "5": {
//     instagram: [
//       "Alpenglow at 5am — worth the frostbite",
//       "Hidden trail above the treeline",
//       "Misty forest, silent shutter",
//       "Gear dump: what's in my camera bag",
//     ],
//     youtube: [
//       "How I plan a landscape shoot",
//       "Wildlife ethics & long lenses explained",
//       "Editing workflow in Lightroom + PS",
//       "Vlog: road trip to the Rockies",
//     ],
//   },
// };

// function buildMockPosts(seed: Omit<RawInfluencer, "posts">): MockPost[] {
//   const platforms = seed.metrics.map((m) => m.platform);
//   const captions = CAPTIONS[seed.id] ?? {};
//   let photoIdx = (Number.parseInt(seed.id, 10) || 0) * 3;
//   const out: MockPost[] = [];

//   for (const platform of platforms) {
//     const quad = captions[platform] ?? [
//       `Post teaser ${platform}`,
//       `${seed.categories[0]} update`,
//       `Behind the scenes — ${seed.name}`,
//       `Saving this for later — ${platform}`,
//     ];

//     for (let i = 0; i < 4; i++) {
//       const slug = PHOTO_ROTATION[photoIdx % PHOTO_ROTATION.length];
//       photoIdx++;
//       const thumbnailUrl = US(slug);
//       const caption = quad[i] ?? quad[i % 4];
//       const postedAt = POSTED_AT[i];
//       const engagementRate = `${(6 + (seed.id.charCodeAt(0) % 5) + i * 0.7).toFixed(1)}%`;
//       const likes = 800 + i * 420 + seed.id.length * 111;
//       const comments = 30 + i * 18 + seed.authenticityScore;

//       const base = {
//         id: `${seed.id}-${platform}-${i + 1}`,
//         platform,
//         thumbnailUrl,
//         caption,
//         likes,
//         comments,
//         engagementRate,
//         postedAt,
//       };

//       if (platform === "instagram") {
//         out.push({
//           ...base,
//           estimatedImpressions: `${(12 + i * 3).toFixed(0)}k`,
//           estimatedReach: `${(8 + i * 2).toFixed(0)}k`,
//           cpe: `$0.${20 + i * 3}`,
//         });
//       } else if (platform === "tiktok") {
//         const views = 9000 + i * 12000 + seed.authenticityScore * 400;
//         const shares = 120 + i * 55;
//         out.push({
//           ...base,
//           views,
//           shares,
//           estimatedImpressions: `${(21 + i * 4).toFixed(0)}k`,
//           estimatedReach: `${(15 + i * 3).toFixed(0)}k`,
//         });
//       } else if (platform === "youtube") {
//         const views = 5000 + i * 9000 + seed.authenticityScore * 200;
//         out.push({
//           ...base,
//           views,
//           estimatedImpressions: `${(44 + i * 6).toFixed(0)}k`,
//           estimatedReach: `${(28 + i * 4).toFixed(0)}k`,
//         });
//       } else {
//         out.push({
//           ...base,
//           estimatedImpressions: `${(6 + i).toFixed(0)}k`,
//           estimatedReach: `${(4 + i).toFixed(0)}k`,
//         });
//       }
//     }
//   }

//   return out;
// }

// const INFLUENCER_SEEDS: Omit<RawInfluencer, "posts">[] = [
//   {
//     id: "1",
//     name: "Zman G",
//     firstName: "Zman",
//     lastName: "Griffin",
//     username: "@seufirefootball",
//     email: "zman.g@creatormail.co",
//     location: { city: "Los Angeles", countryCode: "US", flag: "🇺🇸" },
//     avatar:
//       "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
//     bio: "W/R 🔥 • YouTube: Zman G (17k+) Subscribers",
//     gallery: [
//       "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1550090544-db57b98028af?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop",
//     ],
//     authenticityScore: 88,
//     niches: ["Sports", "Football", "Creator Economy"],
//     metrics: [
//       {
//         platform: "instagram",
//         handle: "@zman.gridiron",
//         followers: "42k",
//         engagement: "10.8%",
//         avgLikes: "4.1k",
//         avgComments: "340",
//         estimatedPriceRange: "$450 - $700",
//         cpe: "$0.28",
//       },
//       {
//         platform: "tiktok",
//         handle: "@zman.g",
//         followers: "338k",
//         engagement: "8.5%",
//         avgLikes: "24.8k",
//         avgComments: "1.2k",
//         avgShares: "690",
//         avgViews: "181k",
//         estimatedPriceRange: "$1.2k - $2.1k",
//         cpe: "$0.16",
//       },
//       {
//         platform: "youtube",
//         handle: "@seufirefootball",
//         followers: "17k",
//         engagement: "5.84%",
//         avgLikes: "1.3k",
//         avgComments: "112",
//         avgViews: "22k",
//         estimatedPriceRange: "$900 - $1.4k",
//         cpv: "$0.04",
//       },
//     ],
//     categories: ["Sports", "Humor", "Video Editing"],
//   },
//   {
//     id: "2",
//     name: "Elena Rostova",
//     firstName: "Elena",
//     lastName: "Rostova",
//     username: "@elena_styles",
//     email: "elena.r@studiofashion.io",
//     location: { city: "London", countryCode: "GB", flag: "🇬🇧" },
//     avatar:
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
//     bio: "Sustainable Fashion 🌿 | Curating slow living aesthetics.",
//     gallery: [
//       "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1550614000-4b9cedc3bc86?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1434389678226-9d8acb3c66f6?q=80&w=400&auto=format&fit=crop",
//     ],
//     authenticityScore: 94,
//     niches: ["Fashion", "Sustainability", "Slow Living"],
//     metrics: [
//       {
//         platform: "instagram",
//         handle: "@elena_styles",
//         followers: "150k",
//         engagement: "4.2%",
//         avgLikes: "6.4k",
//         avgComments: "420",
//         estimatedPriceRange: "$1.6k - $2.8k",
//         cpe: "$0.22",
//       },
//       {
//         platform: "tiktok",
//         handle: "@elena.styles",
//         followers: "89k",
//         engagement: "12.1%",
//         avgLikes: "8.9k",
//         avgComments: "520",
//         avgShares: "420",
//         avgViews: "73k",
//         estimatedPriceRange: "$900 - $1.7k",
//         cpe: "$0.19",
//       },
//     ],
//     categories: ["Fashion", "Sustainability", "Aesthetics"],
//   },
//   {
//     id: "3",
//     name: "Marcus Tech",
//     firstName: "Marcus",
//     lastName: "Reed",
//     username: "@marcusbuilds",
//     email: "marcus.tech@buildlab.dev",
//     location: { city: "San Francisco", countryCode: "US", flag: "🇺🇸" },
//     avatar:
//       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
//     bio: "Building keyboards and taking apart gadgets. ⌨️ Tech Reviewer",
//     gallery: [
//       "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop",
//     ],
//     authenticityScore: 82,
//     niches: ["Technology", "Consumer Electronics", "Keyboards"],
//     metrics: [
//       {
//         platform: "youtube",
//         handle: "@marcusbuilds",
//         followers: "450k",
//         engagement: "6.7%",
//         avgLikes: "18.7k",
//         avgComments: "980",
//         avgViews: "230k",
//         estimatedPriceRange: "$3.4k - $5.2k",
//         cpv: "$0.03",
//       },
//       {
//         platform: "instagram",
//         handle: "@marcusbuilds",
//         followers: "85k",
//         engagement: "3.1%",
//         avgLikes: "2.2k",
//         avgComments: "180",
//         estimatedPriceRange: "$850 - $1.6k",
//         cpe: "$0.31",
//       },
//       {
//         platform: "x",
//         handle: "@marcusbuilds",
//         followers: "110k",
//         engagement: "2.5%",
//         avgLikes: "1.1k",
//         avgComments: "90",
//       },
//     ],
//     categories: ["Technology", "Gadgets", "Reviews"],
//   },
//   {
//     id: "4",
//     name: "Sofia Cooks",
//     username: "@sofiaskitchen",
//     location: { city: "Rome", countryCode: "IT" },
//     avatar:
//       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
//     bio: "Pasta enthusiast 🍝 Sharing my nonna's recipes with the world.",
//     gallery: [
//       "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1563379926898-05f45c514d13?q=80&w=400&auto=format&fit=crop",
//     ],
//     authenticityScore: 97,
//     metrics: [
//       { platform: "instagram", value: "1.2M", engagement: "5.8%" },
//       { platform: "tiktok", value: "2.4M", engagement: "15.3%" },
//       { platform: "youtube", value: "800k", engagement: "8.2%" },
//     ],
//     categories: ["Food", "Cooking", "Lifestyle"],
//   },
//   {
//     id: "5",
//     name: "Alex Trails",
//     username: "@alextrails",
//     location: { city: "Vancouver", countryCode: "CA" },
//     avatar:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
//     bio: "Exploring the unknown 🏔️ Adventure & Wildlife Photographer.",
//     gallery: [
//       "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1470071131384-001b85755536?q=80&w=400&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=400&auto=format&fit=crop",
//     ],
//     authenticityScore: 91,
//     metrics: [
//       { platform: "instagram", value: "320k", engagement: "7.4%" },
//       { platform: "youtube", value: "60k", engagement: "12.9%" },
//     ],
//     categories: ["Travel", "Photography", "Adventure"],
//   },
// ];

// const RAW_INFLUENCERS: RawInfluencer[] = INFLUENCER_SEEDS.map((seed) => ({
//   ...seed,
//   posts: buildMockPosts(seed),
// }));

// const toFlagEmoji = (countryCode: string) => {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split("")
//     .map((char) => 127397 + char.charCodeAt(0));
//   return String.fromCodePoint(...codePoints);
// };

// const maskEmail = (email: string) => {
//   const [local, domain] = email.split("@");
//   const tldIndex = domain.lastIndexOf(".");
//   const baseDomain = tldIndex > -1 ? domain.slice(0, tldIndex) : domain;
//   const tld = tldIndex > -1 ? domain.slice(tldIndex + 1) : "com";
//   return `${"•".repeat(Math.max(local.length, 6))}@${"•".repeat(Math.max(baseDomain.length, 6))}.${"•".repeat(Math.max(tld.length, 3))}`;
// };

// const splitName = (name: string) => {
//   const parts = name.trim().split(" ");
//   return {
//     firstName: parts[0] ?? name,
//     lastName: parts.slice(1).join(" ") || "Creator",
//   };
// };

// export const INFLUENCERS: Influencer[] = RAW_INFLUENCERS.map((influencer) => {
//   const derivedName = splitName(influencer.name);
//   return {
//     ...influencer,
//     firstName: influencer.firstName ?? derivedName.firstName,
//     lastName: influencer.lastName ?? derivedName.lastName,
//     email: maskEmail(
//       influencer.email ??
//         `${influencer.username.replace("@", "")}@apfluence.creator`,
//     ),
//     niches: influencer.niches ?? influencer.categories.slice(0, 2),
//     location: {
//       ...influencer.location,
//       flag:
//         influencer.location.flag ??
//         toFlagEmoji(influencer.location.countryCode),
//     },
//     metrics: influencer.metrics.map((metric) => ({
//       platform: metric.platform,
//       handle: metric.handle ?? influencer.username,
//       followers: metric.followers ?? metric.value ?? "N/A",
//       engagement: metric.engagement,
//       avgLikes: metric.avgLikes ?? "—",
//       avgComments: metric.avgComments ?? "—",
//       avgShares: metric.avgShares,
//       avgViews: metric.avgViews,
//       estimatedPriceRange: metric.estimatedPriceRange,
//       cpe: metric.cpe,
//       cpv: metric.cpv,
//     })),
//     posts: influencer.posts,
//   };
// });
