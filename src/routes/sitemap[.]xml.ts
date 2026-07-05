import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://workvia.upcurv.in";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths: Array<{ path: string; priority: string; changefreq: string }> = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/for-freelancers", priority: "0.9", changefreq: "weekly" },
          { path: "/for-companies", priority: "0.9", changefreq: "weekly" },
          { path: "/how-it-works", priority: "0.8", changefreq: "monthly" },
          { path: "/industries", priority: "0.7", changefreq: "monthly" },
          { path: "/pricing", priority: "0.7", changefreq: "monthly" },
          { path: "/about", priority: "0.6", changefreq: "monthly" },
          { path: "/contact", priority: "0.6", changefreq: "monthly" },
        ];
        const urls = paths
          .map(
            (p) =>
              `  <url><loc>${BASE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
