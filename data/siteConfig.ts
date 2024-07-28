import type { SiteConfig } from "@/lib/types";
const siteConfig: SiteConfig = {
  avatar: "/avatar.png",
  siteUrl: "https://konradstaniszewski.com",
  siteName: "Konrad Staniszewski",
  siteDescription:
    "Konrad Staniszewski's personal blog. I write about software engineering and creative projects.",
  siteThumbnail: "/og-image.png",
  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
  ],
  social: {
    github: "https://github.com/konradstanski",
    linkedin: "https://www.linkedin.com/in/konradstanski/",
  },
};
export default siteConfig;
