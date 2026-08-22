import type { CmsTestimonial } from "@/lib/cms-types";

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
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <strong>{testimonial.person}</strong>
              {(testimonial.role || testimonial.organization) && (
                <span>
                  {[testimonial.role, testimonial.organization].filter(Boolean).join(", ")}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
