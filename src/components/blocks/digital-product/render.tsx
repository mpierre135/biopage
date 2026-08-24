import { BlockRenderProps } from "@/lib/blocks/types";
import { DigitalProductConfig } from "./index";
import { Download, FileDigit } from "lucide-react";

function formatPrice(price: string, currency = "usd"): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(num);
}

export function DigitalProductRender({
  config,
  blockId,
}: BlockRenderProps<DigitalProductConfig>) {
  const {
    title,
    price,
    description,
    thumbnail,
    showPrice = true,
    buttonText = "Get Instant Access",
    currency = "usd",
    productId,
    fileType,
  } = config;

  if (!title) return null;

  const checkoutUrl = productId
    ? `/api/v1/checkout?productId=${productId}`
    : "#";

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      data-block-id={blockId}
      data-event="PRODUCT_VIEW"
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-44 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-28 flex items-center justify-center bg-muted">
          <FileDigit className="size-10 text-muted-foreground" />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {fileType && (
                <span className="text-xs font-medium uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  {fileType}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-card-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {showPrice && price && (
            <span className="shrink-0 font-bold text-card-foreground text-lg">
              {formatPrice(price, currency)}
            </span>
          )}
        </div>
        <a
          href={checkoutUrl}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 hover:bg-primary/90 transition-colors"
          data-block-id={blockId}
          data-event="PRODUCT_CLICK"
        >
          <Download className="size-4" />
          {buttonText}
        </a>
      </div>
    </div>
  );
}
