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
import { videoDescriptor } from "@/components/blocks/video";
import { appleMusicDescriptor } from "@/components/blocks/apple-music";
import { soundcloudDescriptor } from "@/components/blocks/soundcloud";
import { formDescriptor } from "@/components/blocks/form";
import { courseDescriptor } from "@/components/blocks/course";
import { bookingDescriptor } from "@/components/blocks/booking";
import { donationDescriptor } from "@/components/blocks/donation";
import { galleryDescriptor } from "@/components/blocks/gallery";
import { carouselDescriptor } from "@/components/blocks/carousel";
import { testimonialDescriptor } from "@/components/blocks/testimonial";
import { registerBlock } from "./registry";

registerBlock(linkDescriptor);
registerBlock(headerDescriptor);
registerBlock(textDescriptor);
registerBlock(imageDescriptor);
registerBlock(youtubeDescriptor);
registerBlock(vimeoDescriptor);
registerBlock(spotifyDescriptor);
registerBlock(videoDescriptor);
registerBlock(appleMusicDescriptor);
registerBlock(soundcloudDescriptor);
registerBlock(emailCaptureDescriptor);
registerBlock(smsCaptureDescriptor);
registerBlock(formDescriptor);
registerBlock(dividerDescriptor);
registerBlock(productDescriptor);
registerBlock(digitalProductDescriptor);
registerBlock(courseDescriptor);
registerBlock(bookingDescriptor);
registerBlock(donationDescriptor);
registerBlock(customEmbedDescriptor);
registerBlock(socialDescriptor);
registerBlock(contactDescriptor);
registerBlock(faqDescriptor);
registerBlock(countdownDescriptor);
registerBlock(mapDescriptor);
registerBlock(galleryDescriptor);
registerBlock(carouselDescriptor);
registerBlock(testimonialDescriptor);

export { getBlock, listBlocks, listBlocksByCategory, registerBlock, registry } from "./registry";
export type {
  BlockType,
  BlockDescriptor,
  BlockEditorProps,
  BlockRenderProps,
  AnyBlockDescriptor,
} from "./types";
