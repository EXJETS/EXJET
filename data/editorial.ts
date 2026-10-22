import articleData from "./articles.json";
import aircraftArticleData from "./aircraft-articles.json";
import legalData from "./legal.json";
import airportData from "./airports-guide.json";
import routeData from "./routes-guide.json";
import serviceData from "./services.json";
import additionalData from "./seo-content.json";
import ownerData from "./owner-guides.json";
import experienceData from "./experience-pages.json";
import type { ContentPage, ContentSection } from "./content-types";
export type { ContentPage, ContentSection } from "./content-types";

type AirportGuide = {
  slug: string; name: string; city: string; icao: string; iata: string;
  description: string; metaDescription: string; seoTitle: string;
  sections: ContentSection[]; sources: {label:string;url:string}[];
  faqs: {question:string;answer:string}[];
};
type RouteGuide = {
  slug: string; title: string; seoTitle: string; description: string;
  originAirport: string; destinationAirport: string; sections: ContentSection[];
  sources: {label:string;url:string}[]; faqs: {question:string;answer:string}[];
  updated: string;
};
const airportGuides = airportData as AirportGuide[];
const routeGuides = routeData as RouteGuide[];
const additional = [...additionalData, ...ownerData] as ContentPage[];
const articles: ContentPage[] = articleData.map(item => ({
  ...item, path: `/articles/${item.slug}`, kind: "article", kicker: item.category,
  parent: {name:"Flight Guide",path:"/articles"},
  related: item.related.map(slug=>`/articles/${slug}`),
  published: "2026-09-12", updated: "updated" in item ? String(item.updated) : "2026-09-12",
}));
const policies: ContentPage[] = legalData.map(item => ({
  ...item,path:`/${item.slug}`,kind:"legal",kicker:"Legal",draft:true,noindex:true,
}));
const airports: ContentPage[] = airportGuides.map(item => ({
  path:`/airports/${item.slug}`, title:`${item.name} charter guide`, seoTitle:item.seoTitle,
  description:item.metaDescription, kicker:`${item.city} · Airport guide`,kind:"airport",
  parent:{name:"Airports",path:"/airports"},
  facts:[{label:"ICAO",value:item.icao},{label:"IATA",value:item.iata},{label:"Location",value:item.city}],
  sections:item.sections, sources:item.sources, faqs:item.faqs,
  related:routeGuides.filter(route=>[route.originAirport,route.destinationAirport].includes(item.slug)).slice(0,6).map(route=>`/routes/${route.slug}`),
}));
const routes: ContentPage[] = routeGuides.map(item=>({
  ...item,path:`/routes/${item.slug}`,kind:"route",kicker:"Private charter route",
  parent:{name:"Routes",path:"/routes"},
  codes:[item.originAirport,item.destinationAirport].map(code=>airportGuides.find(airport=>airport.slug===code)?.iata || code.toUpperCase()),
  related:[`/airports/${item.originAirport}`,`/airports/${item.destinationAirport}`,"/pricing"],
}));
const services = serviceData as ContentPage[];
const aircraftArticles = aircraftArticleData as ContentPage[];
const allArticles = [...articles,...aircraftArticles,...additional.filter(page=>page.kind==="article")];
const hubs: ContentPage[] = [
  {path:"/aircraft-guides",title:"Business aircraft charter guides",seoTitle:"Business Aircraft Guides: Learjet to Gulfstream | EXJET",description:"Compare Learjet, Hawker, Citation, Challenger, Gulfstream, Global and Falcon aircraft. Practical cabin and trip planning guides for executive assistants and family offices.",kicker:"Aircraft selection",kind:"hub",sections:[{heading:"Choose the model around the trip",paragraphs:["Compare the exact aircraft variant, cabin layout and itinerary before reviewing the price. These guides explain the differences that matter to principals, executive assistants and family offices. Published specifications are reference values; the operating carrier confirms the actual flight."],links:[{label:"Aircraft performance references",path:"/aircraft-performance"},{label:"Aircraft comparisons",path:"/aircraft-comparisons"},{label:"Find a flight",path:"/charter"}]}],items:aircraftArticles.map(page=>page.path),collectionTitle:"Explore by aircraft model"},
  {path:"/articles",title:"Aircraft charter articles and flight planning",seoTitle:"Business Jet Charter Articles & Flight Guide | EXJET",description:"Read practical charter guides covering aircraft, costs, passengers and trip planning. Understand the details, then discuss your itinerary with an EXJET advisor.",kicker:"The EXJET Flight Guide",kind:"hub",sections:[],items:allArticles.map(page=>page.path),collectionTitle:"Knowledge for the journey."},
  {path:"/guides",title:"Private jet charter planning guides",seoTitle:"Private Jet Charter Guides & Booking Advice | EXJET",description:"Prepare your charter with guides to quotes, operator authority, aircraft selection and passenger needs. Get informed before requesting your EXJET proposal.",kicker:"Plan with confidence",kind:"hub",sections:[{heading:"Find the guide for your decision",paragraphs:["Start with the first-flight checklist, compare aircraft and baggage requirements, then review the terms of an actual quote. The operator-review guides explain what to check before you book."],links:[{label:"Charter glossary",path:"/glossary"},{label:"Aircraft comparisons",path:"/aircraft-comparisons"},{label:"Complete charter cost guide",path:"/pricing"}]}],items:allArticles.map(page=>page.path),collectionTitle:"Practical charter guidance."},
  {path:"/routes",title:"Private jet charter routes",seoTitle:"Private Jet Charter Routes, Costs & Flight Times | EXJET",description:"Explore 30 business jet charter routes with airport choices, planning-time estimates and transparent cost examples. Request a quote for your itinerary from EXJET.",kicker:"Wherever comes next",kind:"hub",sections:[{heading:"Plan the whole journey",paragraphs:["Each guide explains a distinct itinerary, with early time allowances and illustrative flight charges. Confirm the actual schedule and complete trip total with your advisor. These pages do not display live availability."],links:[{label:"Compare airports",path:"/airports"},{label:"Understand the cost examples",path:"/pricing"}]}],items:routes.map(page=>page.path),collectionTitle:"Routes to explore."},
  {path:"/airports",title:"Business aviation airport and FBO guides",seoTitle:"Private Jet Airports & FBO Planning Guides | EXJET",description:"Compare airports for business jet charter, including private terminals, transfers and local planning considerations. Find your airport and request an EXJET quote.",kicker:"Closer to your destination",kind:"hub",sections:[{heading:"Start with the destination address",paragraphs:["Compare the airport, the confirmed handling facility and the ground transfer. Airport conditions and aircraft suitability require the operating carrier’s current review; these are passenger planning guides."],links:[{label:"Dallas Love Field and Addison comparison",path:"/private-jet-charter/dallas"}]}],items:airports.map(page=>page.path),collectionTitle:"Know your arrival."},
  {path:"/destinations",title:"Business jet charter destinations",seoTitle:"Private Jet Charter Destinations & Travel Planning | EXJET",description:"Plan aircraft charter to mountain and coastal destinations. Connect airport choices, baggage and transfers, then request a complete itinerary proposal from EXJET.",kicker:"A city. Your own itinerary.",kind:"hub",sections:[{heading:"Plan around the actual stay",paragraphs:["Share the resort, residence or meeting address, your fixed commitments and the flexibility in your schedule. Then compare the flight and the ground journey together."],links:[{label:"Dallas charter hub",path:"/private-jet-charter/dallas"},{label:"New York airport planning",path:"/airports/kteb"},{label:"Los Angeles airport planning",path:"/airports/kvny"},{label:"Miami airport planning",path:"/airports/kopf"}]}],items:additional.filter(page=>page.kind==="destination").map(page=>page.path),collectionTitle:"Destinations to explore."},
  {path:"/aircraft-comparisons",title:"Business jet aircraft comparisons",seoTitle:"Business Jet Charter Aircraft Comparisons | EXJET",description:"Compare charter aircraft by mission, cabin requirements and complete-trip value. Explore Challenger, Citation, Gulfstream and Global comparisons with EXJET.",kicker:"Choose with context",kind:"hub",sections:[],items:additional.filter(page=>page.kind==="comparison").map(page=>page.path),collectionTitle:"Compare the aircraft."},
];
export const contentPages: ContentPage[] = [...hubs,...articles,...aircraftArticles,...airports,...routes,...services,...policies,...additional,...experienceData as ContentPage[]];
export function getContentPage(path:string) { return contentPages.find(page=>page.path===path.replace(/\/$/,"")); }
export const articlePaths = allArticles.map(page=>page.path);
export const routePaths = routes.map(page=>page.path);
