import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://lastminutegifts.co.ke/",
      lastModified: new Date("2026-08-02"),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}