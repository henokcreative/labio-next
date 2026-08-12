export type ProjectImage = {
  src: string;
  alt: string;
  size?: "large" | "small";
};

export type Project = {
  title: string;
  category: string;
  description: string;
  hero: string;
  services: string[];
  challenge: string;
  approach: string;
  images: ProjectImage[];
};

export const projects: Record<string, Project> = {
  "turku-bioscience": {
    title: "Turku Bioscience",
    category: "Web / Digital",
    description:
      "A digital platform for presenting research, people and scientific work at Turku Bioscience.",

    hero: "/images/work/webdesignDev/thumb-bioscience.png",

    services: [
      "Web design",
      "Development",
      "Visual communication",
    ],

    challenge:
      "Present a large and diverse research community online in a way that is clear, accessible and visually engaging.",

    approach:
      "A clean digital structure was developed around the people, research groups and scientific work that make up Turku Bioscience.",

    images: [
      {
        src: "/images/work/webdesignDev/thumb-bioscience.png",
        alt: "Turku Bioscience website",
        size: "large",
      },
      {
        src: "/images/work/webdesignDev/thumb-barrier.JPG",
        alt: "Turku Bioscience project",
        size: "small",
      },
      {
        src: "/images/work/webdesignDev/thumb-inflames.JPG",
        alt: "Turku Bioscience research",
        size: "small",
      },
      {
        src: "/images/work/webdesignDev/thumb-ivaska.png",
        alt: "Turku Bioscience website",
        size: "large",
      },
    ],
  },

  "research-storytelling": {
    title: "Research Storytelling",
    category: "Video / Science communication",
    description:
      "Visual storytelling created to make complex research easier to understand and remember.",

    hero: "/images/work/videos/thumb-inflames.JPG",

    services: [
      "Video production",
      "Storytelling",
      "Editing",
    ],

    challenge:
      "Communicate scientific ideas in a way that is understandable, engaging and memorable beyond the research community.",

    approach:
      "Research stories were translated into visual narratives using filming, interviews, editing and graphic elements.",

    images: [
      {
        src: "/images/work/videos/thumb-inflames.JPG",
        alt: "Research video",
        size: "large",
      },
      {
        src: "/images/work/videos/thumb-barrier.JPG",
        alt: "Research storytelling",
        size: "small",
      },
      {
        src: "/images/work/videos/thumb-bc.JPG",
        alt: "Research video production",
        size: "small",
      },
      {
        src: "/images/work/videos/thumb-tpc.JPG",
        alt: "Research communication",
        size: "large",
      },
    ],
  },

  "laboratory-photography": {
    title: "Laboratory Photography",
    category: "Photography",
    description:
      "Photography capturing people, environments and everyday work within scientific research.",

    hero: "/images/work/photos/pia_lab.jpg",

    services: [
      "Photography",
      "Art direction",
      "Visual communication",
    ],

    challenge:
      "Show the people and environments behind scientific research in an authentic and visually engaging way.",

    approach:
      "Photography focused on people, research environments and the details that make scientific work human.",

    images: [
      {
        src: "/images/work/photos/pia_lab.jpg",
        alt: "Research laboratory",
        size: "large",
      },
      {
        src: "/images/work/photos/filming-henok.jpg",
        alt: "Filming in a research environment",
        size: "small",
      },
      {
        src: "/images/work/photos/Bumbel_bee.jpg",
        alt: "Photography",
        size: "small",
      },
      {
        src: "/images/work/photos/Yellow_flower.jpg",
        alt: "Scientific photography",
        size: "large",
      },
    ],
  },
};