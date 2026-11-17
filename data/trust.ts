export type OperatorReviewItem = {
  title: string;
  description: string;
};

export const operatorReview: OperatorReviewItem[] = [
  {
    title: "Operating authority",
    description: "Each charter is arranged with a licensed third-party air carrier appropriate to the mission.",
  },
  {
    title: "ARGUS and WYVERN",
    description: "Available ARGUS and WYVERN operator safety data may be considered during sourcing and trip-specific review.",
  },
  {
    title: "Trip-specific confirmation",
    description: "Aircraft, operator, crew, insurance, and operating details are reviewed for the proposed trip before confirmation.",
  },
];

export const safetyResources = ["ARGUS", "WYVERN"] as const;

export const publishedPilotCredentials = {
  certificate: "Commercial Pilot Certificate",
  typeRatings: ["CE-650", "CL-65"],
} as const;
