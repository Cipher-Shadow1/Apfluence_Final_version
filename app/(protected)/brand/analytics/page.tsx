"use client";

import ComingSoonPage from "@/components/brand/coming-soon";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Eye,
  Zap,
  LineChart,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      pageName="Analytics"
      completionPercent={27}
      tagline="Turn data into your competitive edge"
      description="Deep performance analytics across all your campaigns — ROI tracking, creator benchmarks, audience insights, and predictive reporting."
      mainIcon={BarChart3}
      mainIconColor="#8B5CF6"
      accentColor="#7C3AED"
      accentColorLight="#F5F3FF"
      gradientFrom="from-blue-50"
      gradientTo="to-purple-50"
      badge="Coming Q4 2026"
      features={[
        "Real-time campaign performance dashboard",
        "ROI and ROAS tracking per creator",
        "Audience overlap and reach analysis",
        "Predictive performance scoring",
        "Exportable reports (PDF, CSV, Slides)",
      ]}
      floatingIcons={[
        {
          icon: TrendingUp,
          size: 50,
          color: "#7C3AED",
          initialX: 7,
          initialY: 12,
          animateX: 20,
          animateY: -18,
          duration: 6,
        },
        {
          icon: PieChart,
          size: 40,
          color: "#8B5CF6",
          initialX: 83,
          initialY: 7,
          animateX: -12,
          animateY: 24,
          duration: 7,
          rotate: 20,
        },
        {
          icon: Activity,
          size: 54,
          color: "#A78BFA",
          initialX: 79,
          initialY: 70,
          animateX: -18,
          animateY: -16,
          duration: 5,
        },
        {
          icon: Target,
          size: 36,
          color: "#7C3AED",
          initialX: 11,
          initialY: 76,
          animateX: 14,
          animateY: -10,
          duration: 8,
        },
        {
          icon: Eye,
          size: 32,
          color: "#8B5CF6",
          initialX: 52,
          initialY: 3,
          animateX: -7,
          animateY: 19,
          duration: 9,
        },
        {
          icon: Zap,
          size: 46,
          color: "#A78BFA",
          initialX: 90,
          initialY: 42,
          animateX: -20,
          animateY: 10,
          duration: 6,
          rotate: -18,
        },
        {
          icon: LineChart,
          size: 38,
          color: "#7C3AED",
          initialX: 3,
          initialY: 48,
          animateX: 16,
          animateY: -22,
          duration: 7,
        },
      ]}
    />
  );
}
