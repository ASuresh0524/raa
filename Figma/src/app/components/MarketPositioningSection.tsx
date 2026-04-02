import { useEffect, useState } from "react";
import { SectionLabel } from "./ui-components";
import { getMarketPositioning, type MarketPositioning } from "../api";

export function MarketPositioningSection() {
  const [data, setData] = useState<MarketPositioning | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMarketPositioning()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled)
          setErr(
            "Could not load this section. With npm run dev, start the API on port 8000 (Vite proxies /api). Or set VITE_API_BASE_URL to your backend; data comes from GET /api/demo/market-positioning."
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <section className="max-w-[1080px] mx-auto px-6 py-16 md:py-20">
        <SectionLabel>Market context</SectionLabel>
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-4">Master record & orchestration</h2>
        <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-2xl">{err}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="max-w-[1080px] mx-auto px-6 py-16 md:py-20">
        <SectionLabel>Market context</SectionLabel>
        <p className="text-[15px] text-muted-foreground mt-4">Loading positioning…</p>
      </section>
    );
  }

  return (
    <section className="max-w-[1080px] mx-auto px-6 py-16 md:py-20">
      <SectionLabel>Market context</SectionLabel>
      <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-2">{data.title}</h2>
      <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-2xl mb-10">{data.subtitle}</p>

      <div className="space-y-4 max-w-2xl">
        {data.thesis.map((p, i) => (
          <p key={i} className="text-[15px] text-foreground leading-[1.75]">
            {p}
          </p>
        ))}
      </div>

      <p className="text-[12px] font-medium tracking-[0.06em] uppercase text-text-secondary mt-12 mb-3">
        What great looks like (hospitals & large groups)
      </p>
      <ol className="list-decimal list-inside space-y-2 text-[15px] text-foreground leading-[1.7] max-w-2xl">
        {data.hospital_capabilities.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ol>

      <p className="text-[15px] text-foreground leading-[1.75] max-w-2xl mt-10">{data.trust_note}</p>

      <blockquote className="mt-8 border-l-[3px] border-border pl-5 text-[15px] text-foreground italic leading-[1.75] max-w-2xl">
        {data.positioning_tagline}
      </blockquote>

      <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-2xl mt-6">{data.why_it_lands}</p>

      <p className="text-[12px] font-medium tracking-[0.06em] uppercase text-text-secondary mt-10 mb-3">Where under-scoped products fail</p>
      <ul className="list-disc list-inside space-y-2 text-[15px] text-muted-foreground leading-[1.7] max-w-2xl">
        {data.ugly_parts.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>

      <p className="text-[16px] font-medium text-foreground mt-10 max-w-2xl leading-[1.6]">{data.bottom_line}</p>

      <p className="text-[12px] font-medium tracking-[0.06em] uppercase text-text-secondary mt-10 mb-3">Maps to this product</p>
      <ul className="list-disc list-inside space-y-2 text-[15px] text-muted-foreground leading-[1.7] max-w-2xl">
        {data.maps_to_product.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>

      <p className="text-[13px] text-text-secondary mt-10">
        Sources:{" "}
        {data.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 ? " · " : null}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 decoration-muted-foreground/40 hover:opacity-85 transition-opacity"
            >
              {s.label}
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}
