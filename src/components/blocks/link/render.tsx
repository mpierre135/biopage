"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import { BlockRenderProps } from "@/lib/blocks/types";
import { LinkConfig } from "./index";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface AnimProps {
  animate?: TargetAndTransition;
  whileHover?: TargetAndTransition;
  transition?: TargetAndTransition["transition"];
}

const animationVariants: Record<NonNullable<LinkConfig["animation"]>, AnimProps> = {
  none: {},
  pulse: {
    animate: { scale: [1, 1.015, 1] } as TargetAndTransition,
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } as TargetAndTransition["transition"],
  },
  shake: {
    whileHover: {
      x: [-3, 3, -3, 3, 0],
      transition: { duration: 0.4 },
    } as TargetAndTransition,
  },
};

export function LinkRender({ config, blockId }: BlockRenderProps<LinkConfig>) {
  const {
    title,
    url,
    thumbnail,
    style = "standard",
    animation = "none",
  } = config;

  if (!title || !url) return null;

  const { animate, whileHover, transition } = animationVariants[animation] ?? {};

  const sharedDataAttrs = {
    "data-block-id": blockId,
    "data-event": "LINK_CLICK",
  } as const;

  const sharedLinkProps = {
    href: url,
    target: "_blank" as const,
    rel: "noopener noreferrer",
    animate,
    whileHover,
    transition,
    ...sharedDataAttrs,
  };

  if (style === "thumbnail" && thumbnail) {
    return (
      <motion.a
        {...sharedLinkProps}
        className="flex items-center gap-3 w-full min-h-11 cursor-pointer rounded-xl border border-border bg-card hover:bg-accent transition-colors duration-200 p-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt=""
          className="size-12 shrink-0 rounded-lg object-cover"
        />
        <span className="flex-1 min-w-0">
          <span className="block font-medium text-sm text-card-foreground truncate">
            {title}
          </span>
        </span>
        <ExternalLink className="size-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.a>
    );
  }

  if (style === "hero" && thumbnail) {
    return (
      <motion.a
        {...sharedLinkProps}
        className="relative flex items-end w-full min-h-32 cursor-pointer rounded-xl overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="relative z-10 w-full px-4 py-4 font-semibold text-white text-base">
          {title}
        </span>
      </motion.a>
    );
  }

  if (style === "featured") {
    return (
      <motion.a
        {...sharedLinkProps}
        className={cn(
          "relative flex items-center justify-center w-full rounded-xl p-[2px]",
          "bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400",
          "hover:shadow-lg hover:shadow-pink-500/25 transition-shadow",
        )}
      >
        <span className="flex items-center justify-center w-full px-4 py-3 rounded-[10px] bg-card text-card-foreground font-semibold text-sm">
          {title}
        </span>
      </motion.a>
    );
  }

  // standard (default)
  return (
    <motion.a
      {...sharedLinkProps}
      className="flex items-center justify-center w-full rounded-xl border border-border bg-card hover:bg-accent text-card-foreground font-semibold text-sm px-4 py-3 transition-colors"
    >
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          className="size-8 rounded-md object-cover mr-3 shrink-0"
        />
      )}
      {title}
    </motion.a>
  );
}
