import Script from "next/script";

export type TrackingPixel = {
  provider: "facebook_pixel" | "google_analytics" | "tiktok_pixel";
  pixelId: string;
};

function sanitizePixelId(id: string): string | null {
  const cleaned = id.trim();
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(cleaned)) return null;
  return cleaned;
}

/**
 * Injects third-party tracking pixels for Pro+ profiles.
 */
export function TrackingPixels({ pixels }: { pixels: TrackingPixel[] }) {
  const safe = pixels
    .map((p) => {
      const pixelId = sanitizePixelId(p.pixelId);
      if (!pixelId) return null;
      return { ...p, pixelId };
    })
    .filter((p): p is TrackingPixel => p !== null);

  if (safe.length === 0) return null;

  return (
    <>
      {safe.map((pixel) => {
        switch (pixel.provider) {
          case "facebook_pixel":
            return (
              <Script
                key={pixel.provider}
                id={`fb-${pixel.pixelId}`}
                strategy="afterInteractive"
              >{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixel.pixelId}');fbq('track','PageView');
              `}</Script>
            );
          case "google_analytics":
            return (
              <span key={pixel.provider}>
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${pixel.pixelId}`}
                  strategy="afterInteractive"
                />
                <Script
                  id={`gtag-${pixel.pixelId}`}
                  strategy="afterInteractive"
                >{`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${pixel.pixelId}');
                `}</Script>
              </span>
            );
          case "tiktok_pixel":
            return (
              <Script
                key={pixel.provider}
                id={`tt-${pixel.pixelId}`}
                strategy="afterInteractive"
              >{`
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${pixel.pixelId}');ttq.page();}(window,document,'ttq');
              `}</Script>
            );
          default: {
            const _exhaustive: never = pixel.provider;
            void _exhaustive;
            return null;
          }
        }
      })}
    </>
  );
}
