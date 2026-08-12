import Image from "next/image";
import Link from "next/link";
import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <div className="site-shell">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        <div className="brand">
          <div>LABIO</div>
          <div>MEDIA</div>
        </div>

        <nav className="main-nav">
          <a href="#home" className="active">Home</a>
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="sidebar-section">

          <div className="sidebar-title">
            WHAT WE DO
          </div>

          <nav className="service-nav">
            <a href="#web">Web</a>
            <a href="#video">Video</a>
            <a href="#photography">Photography</a>
            <a href="#design">Design</a>
          </nav>

        </div>

        <div className="sidebar-bottom">

          <div className="social-links">
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Email">✉</a>
          </div>

          <div className="location">
            <div>© Labio Media</div>
            <div>Turku, Finland</div>
          </div>

        </div>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main-content">


        {/* =========================
            HERO
        ========================= */}

        <section className="hero section" id="home">

          <div className="hero-content">

            <div className="eyebrow">
              RESEARCH COMMUNICATION
              <span />
            </div>

            <h1>
              We make complex
              <br />
              science clear
              <br />
              and visible<span className="accent">.</span>
            </h1>

            <p className="hero-text">
              Labio Media helps research organisations communicate
              their ideas through websites, video, photography and design.
            </p>

            <div className="hero-actions">

              <a href="#work" className="button button-dark">
                View selected work
              </a>

              <a href="#services" className="text-link">
                What we do
                <span>→</span>
              </a>

            </div>

          </div>


          <div className="hero-image">

            <Image
              src="/images/hero/labio-about-hero.jpg"
              alt="Labio Media web design work"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />

            <div className="hero-image-label">
              LABIO MEDIA
            </div>

          </div>

        </section>


        {/* =========================
            TRUSTED BY
        ========================= */}

        <section className="trusted">

          <div className="trusted-title">
            TRUSTED BY RESEARCH GROUPS AND ORGANISATIONS
          </div>

          <div className="trusted-items">

            <span>RESEARCH</span>
            <span>SCIENCE</span>
            <span>BIOMEDICINE</span>
            <span>UNIVERSITIES</span>
            <span>INNOVATION</span>

          </div>

        </section>


        {/* =========================
            SELECTED WORK
        ========================= */}

        <section className="section work-section" id="work">

          <div className="section-heading">

            <div>
              <div className="eyebrow">
                SELECTED WORK
                <span />
              </div>

              <h2>
                Turning research into
                <br />
                meaningful stories
              </h2>
            </div>

            <Link href="/#work" className="text-link desktop-link">
              View all work
              <span>→</span>
            </Link>

          </div>


          <div className="work-grid">


            {/* WORK 01 */}

            <Link
  href="/work/turku-bioscience"
  className="work-card"
>
  <div className="work-image">
    <img
      src="/images/work/webdesignDev/thumb-bioscience.png"
      alt="Turku Bioscience website"
    />
  </div>

  <div className="work-card-body">

    <div className="work-index">01</div>

    <h3>Turku Bioscience Website</h3>

    <p>
      A modern digital platform for showcasing
      research, people and scientific impact.
    </p>

    <div className="work-tags">
      <span>WEB</span>
      <span>DESIGN</span>
    </div>

  </div>
</Link>


            {/* WORK 02 */}
<Link
  href="/work/research-storytelling"
  className="work-card"
>
  <div className="work-image">
    <img
      src="/images/work/videos/thumb-inflames.JPG"
      alt="Research video"
    />
  </div>

  <div className="work-card-body">

    <div className="work-index">02</div>

    <h3>Research Storytelling</h3>

    <p>
      Explaining complex research through
      engaging video and visual storytelling.
    </p>

    <div className="work-tags">
      <span>VIDEO</span>
      <span>PRODUCTION</span>
    </div>

  </div>
</Link>


            {/* WORK 03 */}

          <Link
  href="/work/laboratory-photography"
  className="work-card"
>
  <div className="work-image">
    <img
      src="/images/work/photos/pia_lab.jpg"
      alt="Laboratory photography"
    />
  </div>

  <div className="work-card-body">

    <div className="work-index">03</div>

    <h3>Laboratory Photography</h3>

    <p>
      Capturing people, processes and
      environments in research.
    </p>

    <div className="work-tags">
      <span>PHOTOGRAPHY</span>
    </div>

  </div>
</Link>

          </div>

        </section>


{/* SERVICES */}
<section className="services-section" id="services">

  <div className="section-label">
    <span>WHAT WE DO</span>
  </div>

  <div className="services-heading-row">
    <h2>
      Communication solutions
      <br />
      for research and innovation.
    </h2>

    <a href="#contact" className="section-link">
      See all services <span>→</span>
    </a>
  </div>

  <div className="services-grid">

    {/* WEB */}
    <article className="service-item">
      <div className="service-number">01</div>

      <h3>Web</h3>

      <p>
        Bespoke websites and digital experiences
        for research groups, organisations and
        scientific projects.
      </p>

      <a href="#contact" className="service-link">
        Learn more <span>→</span>
      </a>
    </article>

    {/* VIDEO */}
    <article className="service-item">
      <div className="service-number">02</div>

      <h3>Video</h3>

      <p>
        Research films, interviews and visual
        storytelling that make complex ideas
        easier to understand.
      </p>

      <a href="#contact" className="service-link">
        Learn more <span>→</span>
      </a>
    </article>

    {/* PHOTOGRAPHY */}
    <article className="service-item">
      <div className="service-number">03</div>

      <h3>Photography</h3>

      <p>
        People, laboratories, events and
        environments captured with purpose
        and attention to detail.
      </p>

      <a href="#contact" className="service-link">
        Learn more <span>→</span>
      </a>
    </article>

    {/* DESIGN */}
    <article className="service-item">
      <div className="service-number">04</div>

      <h3>Design</h3>

      <p>
        Visual identities, publications,
        infographics and digital materials
        that make complex information clear.
      </p>

      <a href="#contact" className="service-link">
        Learn more <span>→</span>
      </a>
    </article>

  </div>

</section>

        {/* ABOUT */}
<section id="about" className="about-section">

  <div className="section-label">
    ABOUT LABIO MEDIA
    <span></span>
  </div>

  <div className="about-grid">

    <div className="about-copy">

      <h2>
        Science understanding.
        <br />
        Creative communication.
      </h2>

      <p className="about-lead">
        Labio Media combines scientific understanding with
        creative communication to help research organisations
        explain what they do clearly and effectively.
      </p>

      <p>
        With experience working in research environments,
        I understand both sides of the process — the science
        behind the story and the people who need to understand it.
      </p>

      <p>
        From websites and photography to video and visual design,
        every project starts with the same goal:
        <strong> make complex ideas easier to see, understand and remember.</strong>
      </p>

      <a href="#contact" className="about-button">
        Let&apos;s work together
        <span>→</span>
      </a>

    </div>

    <div className="about-image">
      <img
                src="/images/work/team/hk.jpg"
        alt="Labio Media"
      />
    </div>

  </div>

</section>

{/* =========================
    CONTACT
========================= */}

<section className="contact-page-section" id="contact">

  <div className="contact-heading">

    <div className="section-label">
      CONTACT
      <span></span>
    </div>

    <h2>
      Let&apos;s talk about
      <br />
      your project.
    </h2>

    <p>
      Have an idea, a research project, a website that needs
      a new direction, or simply want to explore something?
    </p>

  </div>


  <div className="contact-form-wrap">
    <ContactForm />
  </div>

</section>


        {/* =========================
            FOOTER
        ========================= */}

        <footer className="footer">

          <span>© Labio Media 2026</span>

          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>

          <div className="footer-social">
            <a href="#">in</a>
            <a href="#">◎</a>
            <a href="#">✉</a>
          </div>

        </footer>

      </main>

    </div>
  );
}
