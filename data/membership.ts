export type MembershipTier = {
  slug: string;
  name: string;
  label: string;
  price: string;
  hours: string;
  featured?: boolean;
  invitationOnly?: boolean;
  benefits: string[];
};

export const membershipTiers: MembershipTier[] = [
  {
    slug: "silver",
    name: "Silver",
    label: "The essential tier",
    price: "$125K",
    hours: "25 flight hours",
    benefits: ["Light jet access", "48-hour booking window", "Annual rate lock", "Dedicated advisor", "Priority lounge access"],
  },
  {
    slug: "gold",
    name: "Gold",
    label: "Most popular",
    price: "$250K",
    hours: "50 flight hours",
    featured: true,
    benefits: ["Light and midsize access", "24-hour booking window", "Guaranteed availability", "Complimentary catering", "Airport transfer credits", "One-way flexibility"],
  },
  {
    slug: "platinum",
    name: "Platinum",
    label: "For the frequent flyer",
    price: "$500K",
    hours: "100 flight hours",
    benefits: ["All Gold benefits", "Popular fleet access", "12-hour booking window", "Concierge travel planning", "International flexibility", "Guest flight privileges", "Hotel and chauffeur partner perks"],
  },
  {
    slug: "diamond",
    name: "Diamond",
    label: "Invitation only",
    price: "$1M",
    hours: "200+ flight hours",
    invitationOnly: true,
    benefits: ["Unlimited fleet access", "Same-day booking guarantee", "Heavy and ultra-long-range jets", "24/7 global concierge", "Family sharing privileges", "Annual private event access", "Dedicated account director", "Fixed global hourly rate"],
  },
];
