"use client";

import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
  className?: string;
  // Changed to string | number to support your "+10k" data
  numPeople?: string | number;
  // Changed to string[] to support simple image paths
  avatarUrls: string[];
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-3", className)}>
      {avatarUrls.map((url, index) => (
        <div key={index}>
          <img
            className="h-7 w-7 rounded-full border-2 border-transparent dark:border-gray-800 object-cover"
            src={url}
            width={28}
            height={28}
            alt={`Avatar ${index + 1}`}
          />
        </div>
      ))}

      {/* Logic to show the bubble if numPeople exists */}
      {numPeople && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-transparent bg-black text-center text-[8px] font-bold text-white dark:border-gray-800 dark:bg-white dark:text-black">
          {/* If it's a number, add the plus. If it's your string "+10k", just show it */}
          {typeof numPeople === "number" ? `+${numPeople}` : numPeople}
        </div>
      )}
    </div>
  );
};
