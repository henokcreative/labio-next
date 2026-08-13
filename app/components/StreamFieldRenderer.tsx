import CmsImage from "./CmsImage";
import type { CmsStreamBlock } from "@/lib/cms-types";

function getEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") {
      return "https://www.youtube-nocookie.com/embed/" + url.pathname.slice(1);
    }
    if (host === "youtube.com" || host === "www.youtube.com") {
      const id = url.searchParams.get("v");
      return id ? "https://www.youtube-nocookie.com/embed/" + id : null;
    }
    if (host === "vimeo.com" || host === "www.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? "https://player.vimeo.com/video/" + id : null;
    }
  } catch {
    return null;
  }
  return null;
}

function StreamBlock({ block }: { block: CmsStreamBlock }) {
  switch (block.type) {
    case "heading":
      return block.value.level === "h3" ? (
        <h3>{block.value.text}</h3>
      ) : (
        <h2>{block.value.text}</h2>
      );
    case "rich_text":
      return (
        <div
          className="cms-rich-text"
          // Wagtail emits expanded HTML from a RichTextBlock restricted to
          // bold, italic, links, ordered lists and unordered lists.
          dangerouslySetInnerHTML={{ __html: block.value }}
        />
      );
    case "image":
      return (
        <figure className="cms-content-image">
          <CmsImage image={block.value} sizes="(max-width: 900px) 100vw, 820px" />
          {block.value.caption && <figcaption>{block.value.caption}</figcaption>}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="cms-quote">
          <p>{block.value.quote}</p>
          {block.value.attribution && <cite>{block.value.attribution}</cite>}
        </blockquote>
      );
    case "embed": {
      const embedUrl = getEmbedUrl(block.value);
      return embedUrl ? (
        <div className="cms-embed">
          <iframe
            src={embedUrl}
            title="Embedded media"
            loading="lazy"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="cms-embed-fallback">
          <a href={block.value}>View embedded media</a>
        </p>
      );
    }
    case "cta":
      return (
        <a className="button button-dark" href={block.value.url}>
          {block.value.label}
        </a>
      );
    default:
      return null;
  }
}

export default function StreamFieldRenderer({
  blocks,
  className = "",
}: {
  blocks: CmsStreamBlock[];
  className?: string;
}) {
  if (blocks.length === 0) return null;

  return (
    <div className={("cms-stream " + className).trim()}>
      {blocks.map((block, index) => (
        <StreamBlock key={block.id || block.type + index} block={block} />
      ))}
    </div>
  );
}
