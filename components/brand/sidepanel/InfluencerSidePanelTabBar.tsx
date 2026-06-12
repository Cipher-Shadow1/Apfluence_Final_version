import { SheetClose } from "@/components/ui/sheet";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Send, UserPlus } from "lucide-react";

const DEFAULT_TABS = ["channels", "outreach", "profile"] as const;
const TABS_WITH_CAMPAIGN = ["campaign", ...DEFAULT_TABS] as const;

export type SidePanelTab = (typeof TABS_WITH_CAMPAIGN)[number];

export function InfluencerSidePanelTabBar({
  tabs = DEFAULT_TABS,
}: {
  tabs?: readonly SidePanelTab[];
}) {
  return (
    <div className="sticky top-0 z-20 bg-white px-6 pt-3 border-b border-[var(--color-border-subtle)]">
      <div className="flex items-center justify-between">
        <TabsList className="h-11 rounded-none bg-transparent p-0 gap-2">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="
    group relative z-10 rounded-none px-2 pb-2 pt-1 text-sm capitalize
    text-zinc-500 transition-colors

    data-[state=active]:text-blue-600 data-[state=active]:font-semibold data-[state=active]:border-b-blue-600
  "
            >
              {tab === "outreach" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  {tab}
                </span>
              ) : tab === "campaign" ? (
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {tab}
                </span>
              ) : (
                tab
              )}

              {/* Animated bottom line */}
              <span
                className="
      pointer-events-none absolute left-1/2 bottom-0 h-[1px] w-0
      -translate-x-1/2 bg-blue-600
      transition-all duration-300 ease-out

      group-hover:w-full
      data-[state=active]:w-full
    "
              />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center gap-1">
          <button className="inline-flex size-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100">
            <UserPlus className="h-5 w-5 text-zinc-600" />
          </button>
          <SheetClose asChild>
            <button className="inline-flex size-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100">
              <span className="text-sm font-semibold">X</span>
            </button>
          </SheetClose>
        </div>
      </div>
    </div>
  );
}
