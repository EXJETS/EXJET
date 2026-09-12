export type AircraftStatus = "charter" | "coming-soon";

export type AircraftScene = {
  id: "exterior" | "cabin" | "seat";
  label: string;
  image?: string;
  portraitImage?: string;
  focalPoint?: string;
  gallery?: Array<{
    image: string;
    portraitImage?: string;
    focalPoint?: string;
    alt?: string;
  }>;
  fit?: "cover" | "contain";
  note?: string;
};

export type Aircraft = {
  slug: string;
  name: string;
  maker: string;
  category: string;
  status: AircraftStatus;
  featured?: boolean;
  summary: string;
  image?: string;
  portraitImage?: string;
  cardFit?: "cover" | "contain";
  typical: {
    passengers: string;
    range: string;
    baggage: string;
    cabin: string;
  };
  scenes: AircraftScene[];
};

export const aircraft: Aircraft[] = [
  {
    "slug": "citation-x",
    "name": "Citation X",
    "maker": "Cessna",
    "category": "Super-midsize",
    "status": "charter",
    "featured": true,
    "summary": "A proven high-speed charter choice for coast-to-coast missions and time-sensitive travel.",
    "cardFit": "contain",
    "typical": {
      "passengers": "Up to 8",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Stand-up cabin"
    },
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/manufacturers/citation-x-flight.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "image": "/images/manufacturers/citation-x-flight.jpg"
  },
  {
    "slug": "challenger-350",
    "name": "Challenger 350",
    "maker": "Bombardier",
    "category": "Super-midsize",
    "status": "charter",
    "featured": true,
    "summary": "A frequent EXJET charter selection with a spacious cabin and versatile mission profile.",
    "cardFit": "contain",
    "typical": {
      "passengers": "Varies by aircraft",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Super-midsize cabin"
    },
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/manufacturers/challenger-350-flight.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "image": "/images/manufacturers/challenger-350-flight.jpg"
  },
  {
    "slug": "citation-latitude",
    "name": "Citation Latitude",
    "maker": "Cessna",
    "category": "Midsize",
    "status": "coming-soon",
    "summary": "A future EXJET-managed aircraft, selected for cabin comfort, flexibility, and balanced performance.",
    "cardFit": "contain",
    "typical": {
      "passengers": "Configuration pending",
      "range": "Mission dependent",
      "baggage": "Configuration pending",
      "cabin": "Stand-up cabin"
    },
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/manufacturers/latitude-header-new.jpg",
        "fit": "contain",
        "focalPoint": "center"
      },
      {
        "id": "cabin",
        "label": "Interior",
        "image": "/images/manufacturers/latitude-interior-new.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "image": "/images/manufacturers/latitude-header-new.jpg"
  },
  {
    "slug": "gulfstream-g650",
    "name": "Gulfstream G650",
    "maker": "Gulfstream",
    "category": "Ultra-long-range",
    "status": "charter",
    "summary": "Long-range access for intercontinental missions, sourced to the requirements of each trip.",
    "cardFit": "contain",
    "typical": {
      "passengers": "Varies by aircraft",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Large-cabin aircraft"
    },
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/manufacturers/g650-flight.jpg",
        "fit": "contain",
        "focalPoint": "center"
      },
      {
        "id": "cabin",
        "label": "Interior",
        "image": "/images/manufacturers/g650-cabin.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "image": "/images/manufacturers/g650-flight.jpg"
  },
  {
    "slug": "global-8000",
    "name": "Global 8000",
    "maker": "Bombardier",
    "category": "Ultra-long-range",
    "status": "charter",
    "summary": "A flagship intercontinental cabin profile shown as a category reference for ultra-long-range charter sourcing.",
    "cardFit": "contain",
    "typical": {
      "passengers": "Varies by aircraft",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Four-zone large cabin"
    },
    "image": "/images/home/owner-selected-hero.webp",
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/home/owner-selected-hero.webp",
        "fit": "contain",
        "focalPoint": "center"
      }
    ]
  },
  {
    "slug": "falcon-900",
    "name": "Falcon 900LX",
    "maker": "Dassault",
    "category": "Heavy jet",
    "status": "charter",
    "summary": "Three-engine capability paired with a comfortable long-range cabin.",
    "image": "/images/manufacturers/falcon-900lx-flight.jpg",
    "typical": {
      "passengers": "Varies by aircraft",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Large-cabin aircraft"
    },
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/manufacturers/falcon-900lx-flight.jpg",
        "fit": "contain",
        "focalPoint": "center"
      },
      {
        "id": "cabin",
        "label": "Interior",
        "image": "/images/manufacturers/falcon-900lx-cabin.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "cardFit": "contain"
  },
  {
    "slug": "falcon-2000lx",
    "name": "Falcon 2000LX",
    "maker": "Dassault",
    "category": "Heavy jet",
    "status": "charter",
    "summary": "A wide-cabin aircraft suited to executive and longer-range charter missions.",
    "typical": {
      "passengers": "Varies by aircraft",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Large-cabin aircraft"
    },
    "scenes": [
      {
        "id": "cabin",
        "label": "Interior",
        "image": "/images/manufacturers/falcon-2000lx-cabin.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "cardFit": "contain",
    "image": "/images/manufacturers/falcon-2000lx-cabin.jpg"
  },
  {
    "slug": "challenger-300",
    "name": "Challenger 300",
    "maker": "Bombardier",
    "category": "Super-midsize",
    "status": "charter",
    "summary": "A versatile charter platform with a comfortable stand-up cabin and practical mission profile.",
    "cardFit": "contain",
    "typical": {
      "passengers": "Varies by aircraft",
      "range": "Mission dependent",
      "baggage": "Varies by configuration",
      "cabin": "Super-midsize cabin"
    },
    "scenes": [
      {
        "id": "exterior",
        "label": "Exterior",
        "image": "/images/manufacturers/challenger-300-flight.jpg",
        "fit": "contain",
        "focalPoint": "center"
      }
    ],
    "image": "/images/manufacturers/challenger-300-flight.jpg"
  }
];

export const featuredAircraft = aircraft.filter((item) => item.featured);

export function getAircraft(slug: string) { return aircraft.find((item) => item.slug === slug); }
