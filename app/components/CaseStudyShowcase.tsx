import CmsImage from "./CmsImage";
import PhotoSlider from "./PhotoSlider";
import StreamFieldRenderer from "./StreamFieldRenderer";
import type {
  CmsCaseStudyShowcaseBlock,
  CmsImage as CmsImageData,
  CmsWebsitePreview,
} from "@/lib/cms-types";

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
}: {
  blocks: CmsCaseStudyShowcaseBlock[];
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="case-study-showcase">
      {blocks.map((block, index) => {
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
          case "video":
            return (
              <section className="case-study-showcase-block showcase-video" key={key}>
                <div className="case-study-showcase-inner">
                  <Heading>{block.value.heading}</Heading>
                  <StreamFieldRenderer blocks={[{ type: "embed", value: block.value.url }]} />
                  {block.value.caption && <p className="showcase-caption">{block.value.caption}</p>}
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
