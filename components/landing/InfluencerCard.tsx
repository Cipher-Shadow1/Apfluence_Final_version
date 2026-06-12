'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface ContentThumbnail {
  imageUrl: string;
  hasTikTokIcon?: boolean;
}

interface Tag {
  label: string;
}

interface InfluencerCardProps {
  profilePhoto: string;
  name: string;
  country: string;
  countryFlag: string;
  bio: string;
  contentThumbnails: ContentThumbnail[];
  score: number;
  followers: {
    platform: string;
    count: string;
  }[];
  tags: Tag[];
  hasCustomerBadge?: boolean;
  hasGreenDotCountry?: boolean;
  reactions?: {
    likes: string;
    comments: string;
  };
}

export default function InfluencerCard({
  profilePhoto,
  name,
  country,
  countryFlag,
  bio,
  contentThumbnails,
  score,
  followers,
  tags,
  hasCustomerBadge,
  hasGreenDotCountry,
  reactions,
}: InfluencerCardProps) {
  return (
    <div
      className="w-full max-w-[520px] bg-white rounded-[14px] px-3 md:px-4 flex items-center gap-2 md:gap-3 overflow-hidden"
      style={{
        border: '1px solid rgba(200, 210, 235, 0.6)',
        boxShadow: '0 2px 12px rgba(80, 100, 180, 0.07)',
        height: reactions ? '104px' : '84px',
        paddingTop: reactions ? '10px' : '12px',
        paddingBottom: reactions ? '10px' : '12px',
      }}
    >
      {/* Zone 1 - Profile Photo */}
      <div className="w-14 h-14 rounded-[10px] overflow-hidden flex-shrink-0 relative">
        <Image src={profilePhoto} alt={name} width={56} height={56} className="w-full h-full object-cover" />
        {hasCustomerBadge && (
          <div
            className="absolute bottom-1 left-1 rounded-full flex items-center justify-center"
            style={{
              width: '18px',
              height: '18px',
              background: 'var(--color-success)',
            }}
          >
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Zone 2 - Profile Info */}
      <div className="w-[100px] sm:w-[140px] min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-semibold text-[var(--color-text-heading)]">{name}</span>
          <ExternalLink className="w-[10px] h-[10px] text-[var(--color-text-faint)]" />
        </div>
        <div className="flex items-center gap-1 mt-1">
          {hasGreenDotCountry && (
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--color-success)',
              }}
            />
          )}
          <span className="text-[14px]">{countryFlag}</span>
          <span className="text-[11px] text-[var(--color-text-muted)]">{country}</span>
        </div>
        <div className="text-[10px] text-[var(--color-text-faint)] truncate max-w-[130px] mt-0.5">
          {bio}
        </div>
        {reactions && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-0.5">
              <span className="text-[11px]">👍</span>
              <span className="text-[9px] text-[var(--color-text-faint)]">{reactions.likes}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[11px]">💬</span>
              <span className="text-[9px] text-[var(--color-text-faint)]">{reactions.comments}</span>
            </div>
          </div>
        )}
      </div>

      {/* Zone 3 - Content Thumbnails */}
      <div className="hidden sm:flex gap-1 flex-shrink-0">
        {contentThumbnails.map((thumbnail, index) => (
          <div key={index} className="relative w-[38px] h-[38px] rounded-md overflow-hidden">
            <Image
              src={thumbnail.imageUrl}
              alt={`Content ${index + 1}`}
              width={38}
              height={38}
              className="w-full h-full object-cover"
            />
            {thumbnail.hasTikTokIcon && (
              <div className="absolute bottom-0.5 right-0.5 bg-black/40 rounded-sm px-0.5">
                <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Zone 4 - Metrics + Tags */}
      <div className="flex-1 flex gap-3 items-center justify-end min-w-0">
        {/* Sub-column A - Performance Metrics */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className="px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(22, 163, 74, 0.12)',
                color: '#16A34A',
              }}
            >
              <span className="text-[10px] font-bold">{score}%</span>
            </div>
            <span className="text-[8px] text-[var(--color-text-faint)] mt-0.5">real</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {followers.map((follower, index) => (
              <div key={index} className="flex items-center gap-1">
                <svg className="w-[9px] h-[9px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="text-[10px] font-medium text-[var(--color-text-body)]">
                  {follower.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-column B - Interest Tags */}
        <div className="flex flex-col gap-1">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(250, 204, 21, 0.15)',
              }}
            >
              <span className="text-[8px]">📍</span>
              <span className="text-[10px] font-medium text-[var(--color-text-subtle)]">{tag.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}