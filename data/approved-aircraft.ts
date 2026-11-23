// Owner-approved website catalogue, not a representation of available or controlled aircraft.
// Only transcribe figures backed by a model-specific manufacturer or aviation authority source on the row.
export type ApprovedAircraft = {
  name: string;
  slug: string;
  maker: string;
  category: string;
  family?: boolean;
  requestOnly?: boolean;
  rangeNm?: number;
  rangeBasis?: string;
  maxPassengers?: number;
  configurationSeats?: number;
  maxSpeed?: string;
  ceiling?: string;
  cabin?: { height?: string; width?: string; length?: string };
  baggage?: string;
  source?: { label: string; url: string };
  notes?: string;
};

type Specs = Omit<ApprovedAircraft, "name" | "slug" | "maker" | "category">;
const profile = (maker: string, category: string, slug: string, name: string, specs: Specs = {}): ApprovedAircraft => ({ maker, category, slug, name, ...specs });
const source = (label: string, url: string) => ({ label, url });
const textron = (category: string, slug: string, name: string, specs?: Specs) => profile("Cessna", category, slug, name, specs);
const gulfstream = (category: string, slug: string, name: string, specs?: Specs) => profile("Gulfstream", category, slug, name, specs);
const bombardier = (category: string, slug: string, name: string, specs?: Specs) => profile("Bombardier", category, slug, name, specs);
const dassault = (category: string, slug: string, name: string, specs?: Specs) => profile("Dassault", category, slug, name, specs);
const hawker = (category: string, slug: string, name: string, specs?: Specs) => profile("Hawker", category, slug, name, specs);
const embraer = (category: string, slug: string, name: string, specs?: Specs) => profile("Embraer", category, slug, name, specs);
const airliner = (maker: string, slug: string, name: string, specs?: Specs) => profile(maker, "VIP airliner", slug, name, { ...specs, requestOnly: true });
const light = "Light";
const mid = "Midsize";
const large = "Large";
const heavy = "Heavy";
const ulr = "Ultra long range";
const textron2004 = source("Textron 2004 Fact Book, Cessna model specifications", "https://clientfiles11.cdn.web.test.q4inc.com/535492436/files/doc_downloads/fact_book/textron_fact_book_2004.pdf");
const g650 = source("Gulfstream G650 and G650ER certification announcement", "https://www.gulfstreamnews.com/en/news/?id=524847be-21dd-440b-b489-73303c3f5bc0");
const eBrochure = source("Embraer business aircraft portfolio specifications", "https://embraer.com/media/b4lchr5u/phenom-300e-electronic.pdf");
const historicalEmbraer = source("Embraer model performance portfolio, page 18", "https://www.embraer.com/media/dg1crlts/defense-security-english.pdf");
const gulfHistory = source("Gulfstream company history and model milestones", "https://www.gulfstreamnews.com/es/history");
const gulfFleet = source("Gulfstream manufacturer fleet specifications", "https://www.gulfstream.com/en/aircraft/");
const bbjAcaps = source("Boeing 737NG airport planning, BBJ payload/range charts", "https://www.boeing.com/content/dam/boeing/boeingdotcom/commercial/airports/acaps/737NG_REV_B.pdf");
const hawker2011 = source("Hawker Beechcraft manufacturer prospectus (SEC archive)", "https://www.sec.gov/Archives/edgar/data/1396425/000119312511129878/d424b3.htm");
const hawker2007 = source("Hawker Beechcraft manufacturer filing (SEC archive)", "https://www.sec.gov/Archives/edgar/data/1396424/000119312507258855/ds4.htm");
const usitc = source("U.S. International Trade Commission historical performance comparison, tables 3.11–3.12", "https://www.usitc.gov/publications/332/pub4314.pdf");
const learTcds = source("EASA Learjet 40/45 applicable type certificate data sheet", "https://www.easa.europa.eu/en/downloads/7485/en");
const falconCompare = source("Dassault technical specifications", "https://www.dassaultfalcon.com/aircraft/compare-aircraft/");
const vipExample = "Representative VIP configuration published by Airbus; exact tail and conditions govern.";
const pax8Mach85 = "8 passengers, Mach 0.85, NBAA IFR reserves";
const alt45 = "45,000 ft";
const alt51 = "51,000 ft";

export const approvedAircraft: ApprovedAircraft[] = [
  textron(light, "citation-cj3", "Citation CJ3", { rangeNm: 1900, maxSpeed: "417 kt cruise", source: textron2004 }),
  textron(light, "citation-cj4", "Citation CJ4", { rangeNm: 1926, rangeBasis: "Textron-published IFR range for the original CJ4", maxSpeed: "451 ktas", source: source("Textron original Citation CJ4 specifications", "https://media.txtav.com/194205-textron-aviation-celebrates-light-jet-segment-leadership-with-the-delivery-of-its-300th-cessna-citation-cj4/") }),
  textron(mid, "citation-excel", "Citation Excel / XL", { notes: "Excel and XL are names for this same model; the XLS and XLS+ have separate entries." }),
  textron(mid, "citation-xls", "Citation XLS", { rangeNm: 2110, maxSpeed: "433 kt cruise", source: textron2004 }),
  textron(mid, "citation-xls-plus", "Citation XLS+", { rangeNm: 2100, maxSpeed: "441 ktas maximum cruise", configurationSeats: 8, source: source("Textron Citation XLS+ performance and representative configuration", "https://vip.txtav.com/en/preowned/used-2014-citation-xls-5606172") }),
  textron(mid, "citation-latitude", "Citation Latitude", { rangeNm: 2700, maxSpeed: "446 ktas maximum cruise", ceiling: alt45, cabin: { height: "6 ft", width: "6 ft 5 in", length: "21 ft 9 in" }, baggage: "127 cu ft", source: source("Textron Citation Latitude specifications", "https://cessna.txtav.com/en/citation/latitude") }),
  textron(large, "citation-sovereign", "Citation Sovereign", { rangeNm: 2847, rangeBasis: "Textron-published example for one configuration; not a fleet-wide figure", maxSpeed: "458 ktas maximum cruise", source: source("Textron Citation Sovereign performance example", "https://vip.txtav.com/en/preowned/used-2005-citation-sovereign-6800012") }),
  textron(large, "citation-sovereign-plus", "Citation Sovereign+", { rangeNm: 3188, maxSpeed: "460 kt maximum cruise", ceiling: alt45, source: source("Textron Citation Sovereign+ EASA certification", "https://media.txtav.com/194719-citation-sovereign-business-jet-receives-easa-certification/") }),
  textron(large, "citation-x", "Citation X", { rangeNm: 3091, rangeBasis: "Textron-published example for one configuration; not a fleet-wide figure", configurationSeats: 8, source: source("Textron Citation X performance and representative cabin", "https://txtav.com/en/preowned/used-2000-citation-x-7500132") }),
  textron(large, "citation-x-plus", "Citation X+", { rangeNm: 3408, maxPassengers: 12, maxSpeed: "Mach 0.935 maximum operating speed", ceiling: alt51, source: source("Textron Citation X+ certification", "https://media.txtav.com/194576-cessna-citation-x-and-sovereign-on-track-for-caac-certification/") }),
  textron(large, "citation-longitude", "Citation Longitude", { rangeNm: 3500, maxSpeed: "483 ktas maximum cruise", ceiling: alt45, cabin: { height: "6 ft", width: "6 ft 5 in", length: "25 ft 2 in" }, baggage: "112 cu ft", source: source("Textron Citation Longitude specifications", "https://cessna.txtav.com/en/citation/longitude") }),
  gulfstream(large, "gulfstream-g200", "Gulfstream G200", { rangeNm: 3400, rangeBasis: "4 passengers; historical USITC comparison", maxSpeed: "Mach 0.85 maximum speed", source: usitc }),
  gulfstream(large, "gulfstream-g280", "Gulfstream G280", { rangeNm: 3600, rangeBasis: "4 passengers, 2 crew, Mach 0.80 and NBAA IFR reserves", maxPassengers: 10, maxSpeed: "Mach 0.84 high-speed cruise", ceiling: alt45, cabin: { height: "6 ft 1 in", width: "6 ft 11 in", length: "25 ft 10 in" }, baggage: "120 cu ft", source: source("Gulfstream G280 specifications", "https://assets.gulfstream.aero/downloads/g280_spec_sheet_english_web_v02.pdf") }),
  gulfstream(heavy, "gulfstream-giv", "Gulfstream GIV", { rangeNm: 4200, maxSpeed: "Mach 0.88", source: gulfHistory }),
  gulfstream(heavy, "gulfstream-giv-sp", "Gulfstream GIV-SP", { source: gulfHistory, notes: "GIV-SP is distinct from GIV. Confirm exact aircraft and performance." }),
  gulfstream(heavy, "gulfstream-g450", "Gulfstream G450", { rangeNm: 4350, rangeBasis: "8 passengers at Mach 0.80", maxPassengers: 16, source: source("General Dynamics / Gulfstream G450 model performance and seating", "https://www.gd.com/Articles/2014/10/14/gulfstream-and-flexjet-enter-new-agreement-50-aircraft") }),
  gulfstream(ulr, "gulfstream-gv", "Gulfstream GV", { rangeNm: 6500, maxSpeed: "Mach 0.885", ceiling: alt51, configurationSeats: 14, source: gulfHistory }),
  gulfstream(ulr, "gulfstream-g550", "Gulfstream G550", { rangeNm: 6750, rangeBasis: "8 passengers, 4 crew at Mach 0.80", maxPassengers: 19, source: source("General Dynamics / Gulfstream G550 performance and seats", "https://www.gd.com/Articles/2017/07/17/gulfstream-delivers-550th-g550") }),
  gulfstream(ulr, "gulfstream-g600", "Gulfstream G600", { rangeNm: 6600, rangeBasis: "8 passengers, 4 crew, Mach 0.85, NBAA IFR reserves", source: gulfFleet }),
  gulfstream(ulr, "gulfstream-g650", "Gulfstream G650", { rangeNm: 7000, maxSpeed: "Mach 0.925 maximum operating speed", source: g650 }),
  gulfstream(ulr, "gulfstream-g700", "Gulfstream G700", { rangeNm: 7750, rangeBasis: pax8Mach85, maxPassengers: 19, maxSpeed: "Mach 0.935 maximum operating speed", source: source("Gulfstream G700 specifications", "https://www.gulfstream.com/en/aircraft/gulfstream-g700/") }),
  gulfstream(ulr, "gulfstream-g800", "Gulfstream G800", { rangeNm: 8200, rangeBasis: "8 passengers, 4 crew, Mach 0.85, NBAA IFR reserves", source: gulfFleet }),
  bombardier(large, "challenger-300", "Challenger 300", { rangeNm: 3100, rangeBasis: "8 passengers; historical USITC comparison", maxPassengers: 10, maxSpeed: "Mach 0.82 maximum speed", source: usitc }),
  bombardier(large, "challenger-350", "Challenger 350", { rangeNm: 3200, rangeBasis: "8 passengers, manufacturer launch specification", source: source("Bombardier Challenger 350 introduction", "https://customer.aero.bombardier.com/webd/BAG/bbad/custsupp/techinfo/NewsEvents.nsf/a1948c97fb7f8c7a85256bd700542f8e/6a88ab783b05696885257b710048a6f7") }),
  bombardier(large, "challenger-3500", "Challenger 3500", { rangeNm: 3400, rangeBasis: "4 passengers, 2 crew, Mach 0.77 and NBAA IFR reserves", maxPassengers: 10, maxSpeed: "Mach 0.83", ceiling: alt45, source: source("Bombardier Challenger 3500 performance declaration", "https://bombardier.com/en/Bombardier-EPD-Challenger3500-en.pdf?attachment=") }),
  bombardier(heavy, "challenger-604", "Challenger 604"),
  bombardier(heavy, "challenger-605", "Challenger 605", { rangeNm: 4000, rangeBasis: "6 passengers; historical USITC comparison", maxPassengers: 13, maxSpeed: "Mach 0.82 maximum speed", source: usitc }),
  bombardier(heavy, "challenger-650", "Challenger 650", { rangeNm: 4000, rangeBasis: "6 passengers, 2 crew, long-range cruise and NBAA IFR reserves", maxPassengers: 12, maxSpeed: "Mach 0.85", ceiling: "41,000 ft", source: source("Bombardier Challenger 650 performance declaration", "https://bombardier.com/en/Bombardier-EPD-Challenger650-en.pdf?attachment=") }),
  bombardier(heavy, "challenger-850", "Challenger 850"),
  dassault(heavy, "falcon-2000lx", "Falcon 2000 family", { family: true, configurationSeats: 8, notes: "The linked manufacturer configuration is one Falcon 2000LX example, not an entire-family capacity. Confirm the exact variant and tail.", source: source("Dassault Falcon 2000LX representative layout", "https://www.dassaultfalcon.com/app/uploads/2026/04/2LX230.pdf") }),
  dassault(heavy, "falcon-900", "Falcon 900 family", { family: true, rangeNm: 4750, rangeBasis: "Falcon 900LX variant only; not the range of every Falcon 900", notes: "The published range is for the Falcon 900LX. Confirm the specific variant and aircraft.", source: source("Dassault Falcon 900LX specifications", "https://www.dassaultfalcon.com/app/uploads/2023/01/Falcon-900LX-Backgrounder.pdf") }),
  dassault(ulr, "falcon-6x", "Falcon 6X", { rangeNm: 5500, rangeBasis: "8 passengers and NBAA IFR reserves", maxPassengers: 16, cabin: { height: "78 in", width: "102 in", length: "40.3 ft" }, baggage: "155 cu ft", source: falconCompare }),
  dassault(ulr, "falcon-7x", "Falcon 7X", { rangeNm: 5950, source: source("Dassault Falcon 7X model performance", "https://www.dassaultfalcon.com/news/execujet-acquisition-reinforces-falcon-mro-networkin-australia-new-zealand-and-asia-pacific/") }),
  dassault(ulr, "falcon-8x", "Falcon 8X", { rangeNm: 6450, rangeBasis: "8 passengers and NBAA IFR reserves", maxPassengers: 16, cabin: { height: "74 in", width: "92 in", length: "42.7 ft" }, baggage: "140 cu ft", source: falconCompare }),
  bombardier(ulr, "global-express", "Global Express"),
  bombardier(ulr, "global-express-xrs", "Global Express XRS"),
  bombardier(ulr, "global-5000", "Global 5000", { rangeNm: 5200, rangeBasis: "8 passengers, 3 crew, Mach 0.85, ISA and NBAA IFR reserves", ceiling: alt51, cabin: { height: "6 ft 2 in", width: "7 ft 11 in", length: "40 ft 9 in" }, source: source("Bombardier Global 5000 specifications", "https://bombardier.com/en/media/2531/download") }),
  bombardier(ulr, "global-5500", "Global 5500", { rangeNm: 5900, rangeBasis: pax8Mach85, maxPassengers: 16, maxSpeed: "Mach 0.90", ceiling: alt51, source: source("Bombardier Global 5500 performance declaration", "https://bombardier.com/en/Bombardier-EPD-Global5500-en.pdf?attachment=") }),
  bombardier(ulr, "global-6000", "Global 6000", { rangeNm: 6000, source: source("Bombardier Global 6000 specifications", "https://bombardier.com/en/media/2516/download") }),
  bombardier(ulr, "global-6500", "Global 6500", { rangeNm: 6600, maxPassengers: 17, maxSpeed: "Mach 0.90", source: source("Bombardier Global 6500 specifications", "https://bombardier.com/en/aircraft/global-6500") }),
  bombardier(ulr, "global-7500", "Global 7500", { rangeNm: 7700, rangeBasis: pax8Mach85, maxPassengers: 19, maxSpeed: "Mach 0.925", ceiling: alt51, baggage: "195 cu ft", source: source("Bombardier Global 7500 performance declaration", "https://bombardier.com/en/Bombardier--EPD-Global7500--en.pdf?attachment=") }),
  bombardier(ulr, "global-8000", "Global 8000", { rangeNm: 8000, maxPassengers: 19, maxSpeed: "Mach 0.95", ceiling: alt51, source: source("Bombardier Global 8000 specifications", "https://bombardier.com/en/aircraft/global-8000") }),
  bombardier(mid, "learjet-60", "Learjet 60"),
  bombardier(light, "learjet-40", "Learjet 40", { maxPassengers: 9, baggage: "51.2 cu ft", source: learTcds, notes: "Certified maximum subject to approved interior; confirm exact tail." }),
  bombardier(light, "learjet-45", "Learjet 45", { maxPassengers: 9, baggage: "51.2 cu ft", source: learTcds, notes: "Certified maximum subject to approved interior; confirm exact tail." }),
  bombardier(light, "learjet-75", "Learjet 75", { rangeNm: 2040, rangeBasis: "4 passengers, 2 crew, ISA, long-range cruise and NBAA IFR reserves", maxSpeed: "Mach 0.79 high-speed cruise", ceiling: alt51, cabin: { height: "4 ft 11 in", width: "5 ft 1 in", length: "19 ft 10 in" }, source: source("Bombardier Learjet 75 brochure", "https://bombardier.com/en/media/2496/download") }),
  hawker(mid, "hawker-750", "Hawker 750", { rangeNm: 2200, rangeBasis: "Approximate range in manufacturer filing", source: hawker2011 }),
  hawker(mid, "hawker-800", "Hawker 800"),
  hawker(mid, "hawker-850", "Hawker 850XP", { rangeNm: 2500, rangeBasis: "Approximate range in manufacturer filing", maxPassengers: 8, source: hawker2007 }),
  hawker(mid, "hawker-900", "Hawker 900XP", { rangeNm: 2900, rangeBasis: "Approximate range in manufacturer filing", source: hawker2011 }),
  hawker(large, "hawker-1000", "Hawker 1000"),
  hawker(large, "hawker-4000", "Hawker 4000", { rangeNm: 3280, maxSpeed: "Mach 0.84", source: hawker2011 }),
  embraer(light, "phenom-300", "Phenom 300", { rangeNm: 1971, rangeBasis: "6 passengers with NBAA reserves", maxSpeed: "450 ktas maximum cruise", ceiling: alt45, source: historicalEmbraer }),
  embraer(light, "phenom-300e", "Phenom 300E", { rangeNm: 2010, rangeBasis: "5 occupants and NBAA reserves", maxSpeed: "464 ktas high-speed cruise", ceiling: alt45, source: eBrochure }),
  embraer(mid, "legacy-450", "Legacy 450", { rangeNm: 2300, rangeBasis: "4 passengers with NBAA reserves (historical portfolio performance basis)", maxSpeed: "Mach 0.83 maximum operating Mach", ceiling: alt45, source: historicalEmbraer }),
  embraer(large, "legacy-500", "Legacy 500", { rangeNm: 3125, rangeBasis: "4 passengers with NBAA reserves", maxSpeed: "466 ktas maximum cruise", ceiling: alt45, source: historicalEmbraer }),
  embraer(heavy, "legacy-600", "Legacy 600"),
  embraer(heavy, "legacy-650", "Legacy 650"),
  embraer(mid, "praetor-500", "Praetor 500", { rangeNm: 3340, rangeBasis: "4 passengers and NBAA IFR reserves", maxSpeed: "466 ktas high-speed cruise", ceiling: alt45, source: eBrochure }),
  embraer(large, "praetor-600", "Praetor 600", { rangeNm: 4018, rangeBasis: "4 passengers and NBAA IFR reserves", maxSpeed: "466 ktas high-speed cruise", ceiling: alt45, source: eBrochure }),
  airliner("Embraer", "lineage-1000", "Lineage 1000"),
  airliner("Embraer", "lineage-1000e", "Lineage 1000E", { rangeNm: 4400, rangeBasis: "8 passengers with NBAA reserves", maxSpeed: "472 ktas maximum cruise", ceiling: "41,000 ft", source: historicalEmbraer }),
  airliner("Airbus Corporate Jets", "acj220", "ACJ TwoTwenty", { rangeNm: 5650, rangeBasis: "Nominal performance with 8 passengers", source: source("Airbus ACJ TwoTwenty model brochure", "https://www.acj.airbus.com/sites/g/files/jlcbta131/files/2021-11/20210720_ACJ%20TwoTwenty%20Brochure%20update_234x165mm_06%20%281%29%20%281%29.pdf") }),
  airliner("Airbus Corporate Jets", "acj318", "ACJ318", { rangeNm: 3450, rangeBasis: vipExample, configurationSeats: 19, maxSpeed: "440 kts", source: source("Airbus ACJ318 Elite configuration example", "https://www.acj.airbus.com/en/a318-elite-lx-lti") }),
  airliner("Airbus Corporate Jets", "acj319", "ACJ319", { rangeNm: 5600, rangeBasis: vipExample, source: source("Airbus ACJ319 configuration reference", "https://www.acj.airbus.com/en/iflyacj/acj319-d-alex") }),
  airliner("Airbus Corporate Jets", "acj320", "ACJ320", { rangeNm: 3500, rangeBasis: vipExample, configurationSeats: 31, maxSpeed: "486 kts", source: source("Airbus ACJ320 configuration example", "https://www.acj.airbus.com/en/iflyacj/acj320-p4-hsj") }),
  airliner("Airbus Corporate Jets", "acj330", "ACJ330"),
  airliner("Airbus Corporate Jets", "acj340", "ACJ340", { rangeNm: 6200, rangeBasis: vipExample, configurationSeats: 100, source: source("Airbus ACJ340 configuration example", "https://www.acj.airbus.com/en/iflyacj/acj340-9h-big") }),
  airliner("Boeing Business Jets", "bbj1", "Boeing BBJ1", { source: bbjAcaps, notes: "Boeing publishes payload/range charts for multiple auxiliary-tank configurations rather than one universal range." }),
  airliner("Boeing Business Jets", "bbj2", "Boeing BBJ2", { source: bbjAcaps }),
  airliner("Boeing Business Jets", "bbj3", "Boeing BBJ3", { source: bbjAcaps }),
  airliner("Boeing Business Jets", "boeing-767", "Boeing 767 VIP", { family: true, notes: "Request-only. Range and passenger capacity depend on the exact 767 airframe and completion." }),
];
