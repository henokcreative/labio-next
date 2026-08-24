import CmsImage from "./CmsImage";
import PhotoSlider from "./PhotoSlider";
import StreamFieldRenderer from "./StreamFieldRenderer";
import type {
  CmsMediaShowcaseBlock,
  CmsImage as CmsImageData,
  CmsWebsitePreview,
} from "@/lib/cms-types";
import { groupCaseStudyShowcaseBlocks } from "@/lib/case-study-showcase";

function Heading({ children }: { children: string }) {
  return children ? <h2 className="showcase-heading">{children}</h2> : null;
}

function ImageFigure({
  image,
  sizes,
}: {
  image: CmsImageData;
  sizes: string;
}) {
  return (
    <figure className="showcase-image-figure">
      <CmsImage image={image} sizes={sizes} />
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}

function WebsitePreview({ item }: { item: CmsWebsitePreview }) {
  const content = (
    <>
      <div className="showcase-website-media">
        <CmsImage image={item.image} sizes="(max-width: 700px) 100vw, 40vw" />
      </div>
      <div className="showcase-website-copy">
        <h3>{item.label}{item.url && <span aria-hidden="true"> ↗</span>}</h3>
        {item.caption && <p>{item.caption}</p>}
      </div>
    </>
  );

  return item.url ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <article>{content}</article>
  );
}

export default function CaseStudyShowcase({
  blocks,
  variant = "case-study",
}: {
  blocks: CmsMediaShowcaseBlock[];
  variant?: "case-study" | "update";
}) {
  if (blocks.length === 0) return null;

  const groups = groupCaseStudyShowcaseBlocks(blocks);

  return (
    <div className={variant === "update"
      ? "case-study-showcase update-media-showcase"
      : "case-study-showcase"}
    >
      {groups.map((group, index) => {
        if (group.type === "video_grid") {
          const countClass = `showcase-video-count-${Math.min(group.blocks.length, 3)}`;
          const key = group.blocks[0].id || `video-grid-${index}`;

          return (
            <section className="case-study-showcase-block showcase-video" key={key}>
              <div className="case-study-showcase-inner">
                <div className={`showcase-video-grid ${countClass}`}>
                  {group.blocks.map((video, videoIndex) => (
                    <article
                      className="showcase-video-item"
                      key={video.id || `${video.value.url}-${videoIndex}`}
                    >
                      <StreamFieldRenderer
                        blocks={[{ type: "embed", value: video.value.url }]}
                        embedPresentation="showcase"
                      />
                      {video.value.heading && (
                        <h2 className="showcase-video-heading">{video.value.heading}</h2>
                      )}
                      {video.value.caption && (
                        <p className="showcase-caption">{video.value.caption}</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        const block = group.block;
        const key = block.id || `${block.type}-${index}`;
        switch (block.type) {
          case "photo_slider":
            return <PhotoSlider key={key} {...block.value} />;
          case "masonry_gallery":
            return (
              <section className="case-study-showcase-block" key={key}>
                <div className="case-study-showcase-inner">
                  <Heading>{block.value.heading}</Heading>
                  <div className="showcase-masonry">
                    {block.value.images.map((image, imageIndex) => (
                      <ImageFigure
                        key={`${image.url}-${imageIndex}`}
                        image={image}
                        sizes="(max-width: 700px) 100vw, 32vw"
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          case "image_grid":
            return (
              <section className="case-study-showcase-block" key={key}>
                <div className="case-study-showcase-inner">
                  <Heading>{block.value.heading}</Heading>
                  <div className={`showcase-image-grid showcase-columns-${block.value.columns}`}>
                    {block.value.images.map((image, imageIndex) => (
                      <ImageFigure
                        key={`${image.url}-${imageIndex}`}
                        image={image}
                        sizes={block.value.columns === 2
                          ? "(max-width: 700px) 100vw, 45vw"
                          : "(max-width: 700px) 100vw, 30vw"}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          case "image_pair":
            return (
              <section className="case-study-showcase-block" key={key}>
                <div className="case-study-showcase-inner">
                  <Heading>{block.value.heading}</Heading>
                  <div className="showcase-image-pair">
                    <ImageFigure image={block.value.firstImage} sizes="(max-width: 700px) 100vw, 45vw" />
                    <ImageFigure image={block.value.secondImage} sizes="(max-width: 700px) 100vw, 45vw" />
                  </div>
                </div>
              </section>
            );
          case "website_preview_grid":
            return (
              <section className="case-study-showcase-block" key={key}>
                <div className="case-study-showcase-inner">
                  <Heading>{block.value.heading}</Heading>
                  <div className="showcase-website-grid">
                    {block.value.items.map((item, itemIndex) => (
                      <WebsitePreview key={`${item.image.url}-${itemIndex}`} item={item} />
                    ))}
                  </div>
                </div>
              </section>
            );
          case "wide_image":
            return (
              <section className="case-study-showcase-block" key={key}>
                <div className="case-study-showcase-inner showcase-wide-image">
                  <Heading>{block.value.heading}</Heading>
                  <figure className="showcase-image-figure">
                    <CmsImage
                      image={block.value.image}
                      sizes="(max-width: 900px) 100vw, calc(100vw - 340px)"
                    />
                    {block.value.caption && <figcaption>{block.value.caption}</figcaption>}
                  </figure>
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
