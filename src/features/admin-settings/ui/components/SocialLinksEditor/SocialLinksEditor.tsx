"use client";

import type { SocialLinks } from "@/core/settings";
import { SVG_ASSETS } from "@/shared/assets/svg";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";

type Network = keyof SocialLinks;

type NetworkMeta = {
  key: Network;
  label: string;
  placeholder: string;
  src?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
};

const NETWORKS: NetworkMeta[] = [
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/tunegocio",
    src: SVG_ASSETS.instagram,
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/tunegocio",
    src: SVG_ASSETS.facebook,
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@tunegocio",
    src: SVG_ASSETS.tiktok,
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@tunegocio",
    src: SVG_ASSETS.youtube,
  },
  {
    key: "twitter",
    label: "X / Twitter",
    placeholder: "https://x.com/tunegocio",
    src: SVG_ASSETS.twitter,
  },
];

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLinks;
  onChange: (v: SocialLinks) => void;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {NETWORKS.map(({ key, label, placeholder, src, fallbackIcon: Fallback }) => {
        const inputId = `social-${key}`;
        const current = value[key] ?? "";
        return (
          <li key={key} className="flex flex-col gap-1.5">
            <Label
              htmlFor={inputId}
              className="flex items-center gap-2 text-xs font-medium"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  aria-hidden
                  className="h-5 w-5 shrink-0 object-contain"
                />
              ) : Fallback ? (
                <Fallback className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : null}
              {label}
            </Label>
            <Input
              id={inputId}
              type="url"
              inputMode="url"
              value={current}
              onChange={(e) =>
                onChange({ ...value, [key]: e.target.value })
              }
              placeholder={placeholder}
              className="h-10"
            />
          </li>
        );
      })}
    </ul>
  );
}

export const SOCIAL_NETWORKS = NETWORKS;
