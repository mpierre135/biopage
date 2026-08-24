import { BlockRenderProps } from "@/lib/blocks/types";
import { ImageConfig } from "./index";

export function ImageRender({ config }: BlockRenderProps<ImageConfig>) {
  const { url, alt = "", linkUrl } = config;

  if (!url) return null;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className="w-full h-auto rounded-xl object-cover"
      loading="lazy"
    />
  );

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full overflow-hidden rounded-xl"
      >
        {img}
      </a>
    );
  }

  return <div className="w-full overflow-hidden rounded-xl">{img}</div>;
}
