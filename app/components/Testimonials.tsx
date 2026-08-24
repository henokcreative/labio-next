import type { CmsTestimonial } from "@/lib/cms-types";
import CmsImage from "./CmsImage";

export default function Testimonials({
  testimonials,
  heading = "Client perspectives",
}: {
  testimonials: CmsTestimonial[];
  heading?: string;
}) {
  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-heading">
      <h2 className="section-label" id="testimonials-heading">
        {heading} <span />
      </h2>
      <div className="testimonials-list">
        {testimonials.map((testimonial) => (
          <figure className="testimonial" key={testimonial.id}>
            <div className={testimonial.portrait
              ? "testimonial-composition has-portrait"
              : "testimonial-composition"}
            >
              {testimonial.portrait && (
                <div className="testimonial-portrait">
                  <CmsImage image={testimonial.portrait} sizes="72px" />
                </div>
              )}
              <div className="testimonial-copy">
                <span className="testimonial-quote-mark" aria-hidden="true">“</span>
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption>
                  <strong>{testimonial.person}</strong>
                  {(testimonial.role || testimonial.organization) && (
                    <span>
                      {[testimonial.role, testimonial.organization].filter(Boolean).join(", ")}
                    </span>
                  )}
                </figcaption>
              </div>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
