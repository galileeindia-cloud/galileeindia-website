import type { Metadata } from "next";

const SITE_NAME = "Galilee Prayer Fellowship";

/**
 * `title` should be the short, page-specific part only (e.g. "Bible Quiz")
 * — the root layout's title.template appends " | Galilee Prayer Fellowship"
 * to it automatically for the <title> tag. openGraph/twitter titles aren't
 * templated, and also don't inherit a route's plain title/description, so
 * the full string is built here explicitly for both.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  /**
   * A route segment's own `opengraph-image` file is only auto-attached to
   * metadata generated for that same segment — a nested dynamic route
   * (e.g. bible-puzzle/[id]) that returns its own openGraph object here
   * fully replaces the inherited one, silently dropping the image unless
   * it's referenced explicitly. Pass the ancestor's image route when this
   * page doesn't have its own (e.g. "/bible-puzzle/opengraph-image").
   */
  image?: string;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
