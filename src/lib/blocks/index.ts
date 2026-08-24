import { z } from "zod";
import {
  Video,
  Music,
  FileText,
  GraduationCap,
  CalendarDays,
  Heart,
  Images,
  ChevronRight,
  Star,
} from "lucide-react";
import { ComponentType } from "react";
import { BlockEditorProps, BlockRenderProps, BlockType } from "./types";
import { registerBlock } from "./registry";

import { linkDescriptor } from "@/components/blocks/link";
import { headerDescriptor } from "@/components/blocks/header";
import { textDescriptor } from "@/components/blocks/text";
import { imageDescriptor } from "@/components/blocks/image";
import { youtubeDescriptor } from "@/components/blocks/youtube";
import { emailCaptureDescriptor } from "@/components/blocks/email-capture";
import { smsCaptureDescriptor } from "@/components/blocks/sms-capture";
import { dividerDescriptor } from "@/components/blocks/divider";
import { productDescriptor } from "@/components/blocks/product";
import { digitalProductDescriptor } from "@/components/blocks/digital-product";
import { customEmbedDescriptor } from "@/components/blocks/custom-embed";
import { vimeoDescriptor } from "@/components/blocks/vimeo";
import { spotifyDescriptor } from "@/components/blocks/spotify";
import { socialDescriptor } from "@/components/blocks/social";
import { contactDescriptor } from "@/components/blocks/contact";
import { faqDescriptor } from "@/components/blocks/faq";
import { countdownDescriptor } from "@/components/blocks/countdown";
import { mapDescriptor } from "@/components/blocks/map";

registerBlock(linkDescriptor);
registerBlock(headerDescriptor);
registerBlock(textDescriptor);
registerBlock(imageDescriptor);
registerBlock(youtubeDescriptor);
registerBlock(vimeoDescriptor);
registerBlock(spotifyDescriptor);
registerBlock(emailCaptureDescriptor);
registerBlock(smsCaptureDescriptor);
registerBlock(dividerDescriptor);
registerBlock(productDescriptor);
registerBlock(digitalProductDescriptor);
registerBlock(customEmbedDescriptor);
registerBlock(socialDescriptor);
registerBlock(contactDescriptor);
registerBlock(faqDescriptor);
registerBlock(countdownDescriptor);
registerBlock(mapDescriptor);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function StubRender(_props: BlockRenderProps<any>) {
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function StubEditor(_props: BlockEditorProps<any>) {
  return null;
}

const stubSchema = z.record(z.string(), z.unknown());

function stub(
  type: BlockType,
  label: string,
  description: string,
  icon: ComponentType,
  category: "links" | "media" | "capture" | "commerce" | "layout",
  requiredFeature?: string,
) {
  registerBlock({
    type,
    label,
    description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: icon as any,
    category,
    schema: stubSchema,
    defaultConfig: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Render: StubRender as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Editor: StubEditor as any,
    requiredFeature,
    ready: false,
  });
}

stub("VIDEO", "Video", "Embed a hosted video file", Video, "media");
stub("APPLE_MUSIC", "Apple Music", "Embed an Apple Music song or album", Music, "media");
stub("SOUNDCLOUD", "SoundCloud", "Embed a SoundCloud track", Music, "media");
stub("FORM", "Form", "A custom multi-field form", FileText, "capture", "forms");
stub("COURSE", "Course", "Sell and showcase a course", GraduationCap, "commerce", "courses");
stub("BOOKING", "Booking", "Let visitors book time with you", CalendarDays, "commerce", "booking");
stub("DONATION", "Donation", "Accept tips or donations", Heart, "commerce", "donations");
stub("GALLERY", "Gallery", "A photo gallery grid", Images, "media", "gallery");
stub("CAROUSEL", "Carousel", "A swipeable image carousel", ChevronRight, "media", "gallery");
stub("TESTIMONIAL", "Testimonial", "A quote or social proof block", Star, "layout");

export { getBlock, listBlocks, listBlocksByCategory, registerBlock, registry } from "./registry";
export type {
  BlockType,
  BlockDescriptor,
  BlockEditorProps,
  BlockRenderProps,
  AnyBlockDescriptor,
} from "./types";
