"use client";

import ComingSoonPage from "@/components/brand/coming-soon";
import {
  Headphones,
  MessageCircle,
  BookOpen,
  LifeBuoy,
  HelpCircle,
  Bot,
  Phone,
  Star,
} from "lucide-react";

export default function SupportPage() {
  return (
    <ComingSoonPage
      pageName="Support"
      completionPercent={76}
      tagline="We are here whenever you need us"
      description="Access our help center, live chat with our team, or get instant answers from our AI assistant — dedicated support for every plan."
      mainIcon={Headphones}
      mainIconColor="#EC4899"
      accentColor="#DB2777"
      accentColorLight="#FDF2F8"
      gradientFrom="from-pink-50"
      gradientTo="to-rose-50"
      badge="Live on Launch"
      features={[
        "24/7 AI-powered help assistant",
        "Live chat with campaign specialists",
        "Comprehensive video tutorial library",
        "Dedicated account manager (Pro+)",
        "Community forum and creator network",
      ]}
      floatingIcons={[
        {
          icon: MessageCircle,
          size: 50,
          color: "#DB2777",
          initialX: 9,
          initialY: 11,
          animateX: 18,
          animateY: -16,
          duration: 6,
        },
        {
          icon: BookOpen,
          size: 38,
          color: "#EC4899",
          initialX: 82,
          initialY: 9,
          animateX: -13,
          animateY: 21,
          duration: 7,
          rotate: 10,
        },
        {
          icon: LifeBuoy,
          size: 56,
          color: "#F9A8D4",
          initialX: 78,
          initialY: 71,
          animateX: -16,
          animateY: -18,
          duration: 5,
          rotate: -30,
        },
        {
          icon: HelpCircle,
          size: 36,
          color: "#DB2777",
          initialX: 12,
          initialY: 77,
          animateX: 13,
          animateY: -9,
          duration: 8,
        },
        {
          icon: Bot,
          size: 44,
          color: "#EC4899",
          initialX: 50,
          initialY: 4,
          animateX: -5,
          animateY: 17,
          duration: 9,
        },
        {
          icon: Phone,
          size: 32,
          color: "#F9A8D4",
          initialX: 91,
          initialY: 41,
          animateX: -17,
          animateY: 11,
          duration: 6,
        },
        {
          icon: Star,
          size: 40,
          color: "#DB2777",
          initialX: 4,
          initialY: 46,
          animateX: 15,
          animateY: -20,
          duration: 7,
          rotate: 25,
        },
      ]}
    />
  );
}
