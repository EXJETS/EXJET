import type { ContentSection } from "./content-types";

/** Additional sections for pages the 2026 audit measured under 300 words. Claims stay inside what the site already says. */
export const pageExpansions: Record<string, ContentSection[]> = {
  "/accessibility": [{
    heading: "Asking for help with a page or a trip",
    paragraphs: [
      "If a control, a document, or an aircraft page is hard to use, contact EXJET and name the page address and the task you were trying to finish. That is more useful than a general comment, because the advisor can then repeat the information in email or on the phone. Charter requests, empty-leg questions, and sales notes can all be taken that way. You do not have to complete an online form to be helped.",
      "The quote and contact forms are ordinary HTML forms. They can be submitted without JavaScript. Labels sit with their fields, and the submit button states what will be sent. If a browser extension changes colors or spacing, the text of the request still goes to the same desk. EXJET does not claim the website meets a particular conformance level. The practical standard is that a client can reach the same information by phone, email, or the form.",
      "Aircraft photographs are examples of types, not a promise of a particular tail number. If an image has no text alternative, it is decorative and the nearby heading carries the meaning. The logo is named EXJET so the home link is clear without relying on the picture alone. If you use a screen reader, the skip link at the top of each page moves past the navigation.",
    ],
  }],
  "/fractional": [{
    heading: "What to put in a fractional brief",
    paragraphs: [
      "A useful fractional conversation starts with the trips you actually take, not with a share size. List the cities, the usual days of the week, how often the plans change, and how many people travel. Add the baggage or pets that have constrained you before. EXJET can then compare that pattern with on-demand charter for the same trips and with the program structures a provider is willing to describe. The provider’s contract, not this page, sets hours, peak-day rules, and what happens if you leave.",
      "Ask for the aircraft category in writing, the notice required to book, and which fees sit outside the monthly or annual figure. Occupied hours, fuel, landing, and overnight items are easy to miss when the comparison is only the share price. If the travel is seasonal, say so. A program sized for a peak month can be the wrong tool for a quiet one, and charter may cover the peak without a year-round commitment. EXJET’s role is the comparison and the coordination. The fractional company remains responsible for its own aircraft and service terms.",
      "Bring the last year’s trips if you have them, including the ones that were cancelled or moved. That record shows peak days and deadheads more honestly than a hoped-for schedule. EXJET will not invent a savings figure. The comparison is only as good as the provider terms you are allowed to read and the charter quotes for the same city pairs.",
    ],
  }],
  "/ownership": [{
    heading: "Questions to settle before you narrow the search",
    paragraphs: [
      "Ownership planning is a sequence, not a single listing. Start with the mission the aircraft has to fly most often, the longest trip you care about, and the airport you want to use as a base. Then separate the purchase budget from the cost of keeping the aircraft available: crew, maintenance, insurance, hangar, and management. EXJET can help you line those questions up and introduce the technical, legal, and tax advisers you choose. Those advisers, not the website, give the opinions their professions require.",
      "If you already own an aircraft, the same brief works in reverse. Say whether you want to sell, to change management, or to plan a cabin or maintenance project. Historical listing details on the sales pages are references. They are not a statement that EXJET represents that aircraft or that the recorded times are current. Ask for a written scope before records are requested or an inspection is booked.",
      "Dallas is the office, not a claim that every aircraft EXJET discusses is based there. Say where the aircraft lives and where it needs to be. Management, maintenance, and charter backup can be scoped together or one at a time. The contact form is enough to start. A trip that simply needs an aircraft on a date belongs on the quote form instead.",
    ],
  }],
  "/group-charter/corporate-teams": [{
    heading: "Build the brief before you ask for aircraft",
    paragraphs: [
      "A corporate movement is easier to price when the approval path is clear. Name the person who can accept the aircraft and the total, and say whether a change of passenger or a weather delay needs the same approval. Include the meeting address, the time people must be in the room, and whether anyone is joining or leaving in another city. That is the itinerary. The aircraft choice follows it.",
      "Tell EXJET how the travelers will get from the airport to the office, and whether baggage includes booths, samples, or equipment that cannot go in a normal cabin closet. If the group may split across two aircraft, say that at the start so the schedule can be compared rather than discovered after a quote. EXJET coordinates the brief with licensed third-party carriers. The carrier operates the flight and confirms the actual seating and baggage limit.",
    ],
  }],
  "/aircraft-comparisons": [{
    heading: "How to use a comparison",
    paragraphs: [
      "These pages put two types next to each other so you can see which questions to ask. They are not a ranking, and they are not a statement that either aircraft is available for your date. Start with the passenger count, the baggage, and the city pair. Then ask an advisor for offers on that trip. Two aircraft with similar brochure ranges can still differ once the operator applies reserves, weather, and the runway you intend to use.",
      "Cabin length and baggage volume matter only if they match the way your group travels. A shorter cabin with the right baggage door can be the better charter. A longer cabin is not an advantage if the offered aircraft cannot make the trip with your load. Use the comparison to prepare the request, then judge the written options. Manufacturer figures on the performance pages are references. The operating carrier confirms the flight.",
    ],
  }],
  "/cargo/dallas": [{
    heading: "What Dallas cargo requests should include",
    paragraphs: [
      "From Dallas, name the airport you can use and the airport the shipment must reach, not only the cities. Give the piece count, the dimensions, and the weight, and say whether the freight is palletized or needs a forklift. A deadline is a delivery time at the destination, including the truck on each end, not only the departure. If the freight is hazardous, perishable, or valuable, say that in the first note so the wrong aircraft is not quoted.",
      "EXJET coordinates the request with operators who can carry the load. The operator confirms the door size, the floor loading, and any permit. A passenger-cabin aircraft is sometimes discussed for small freight, and a freighter for everything else. The quote should say which one is proposed. Call the cargo desk if the shipment is already on a dock and the form is slower than the phone.",
    ],
  }],
  "/destinations/palm-beach": [{
    heading: "Planning the Palm Beach arrival",
    paragraphs: [
      "Give the advisor the address you are actually going to, not only “Palm Beach.” The resort, the club, or the house changes which airport and which drive make sense. Use the current DJT identifier on the itinerary even if an older note still says PBI, and ask the handler to confirm they have the same code. Winter weekends and event weeks fill ramps and hotel transfers. A flexible arrival window is easier to protect than a single minute.",
      "Say how many bags and golf sets are travelling, and whether anyone is connecting from a commercial flight the same day. EXJET can request the aircraft and coordinate the ground plan you describe. The airport, the handler, and the car company each confirm their own part. Nothing on this page is a reserved slot or a published fare.",
    ],
  }],
  "/destinations/vail": [{
    heading: "What to send with a Vail request",
    paragraphs: [
      "Name Eagle County as the usual airport reference and then name the door you need to reach in Vail or Beaver Creek. The drive is part of the trip. A morning on snow and an evening departure are different briefs, especially when weather can close the mountain roads or slow the ramp. Tell EXJET if the group is carrying skis, boots, or a child’s seat, and whether the return day can move if the weather does.",
      "Aircraft performance into a mountain airport is the operator’s calculation, not a brochure range. Ask which aircraft types the carrier is willing to propose for your date and load, and what the alternate airport would be if the weather changes. EXJET arranges the request. The licensed carrier decides whether the flight can be operated.",
    ],
  }],
  "/group-charter/sports-teams": [{
    heading: "Equipment, roster, and the return",
    paragraphs: [
      "A team request should list athletes and staff separately from guests, because the seat map and the baggage hold are both limited. Describe the equipment in cases or bags, not as a single word like “gear,” and say whether it has to ride on the same aircraft as the roster. Medical staff, a tight turn between games, and a preferred arrival before a practice are all part of the brief. If the roster can change after the quote, say who is allowed to change it.",
      "The return is a second flight, not a footnote. Include the city, the earliest departure after the event, and what happens if the event runs long. EXJET coordinates the plan with third-party carriers. Seating, freight on board, and the operating rules are confirmed by the carrier for that trip. A quote is not a reservation.",
    ],
  }],
  "/services": [{
    heading: "How to choose where to start",
    paragraphs: [
      "Start with the outcome, not the product name. If people or freight need to be somewhere on a date, begin with charter or cargo. If you need an aircraft without crew for a period, read the dry-lease page. If you need the aircraft, crew, maintenance, and insurance together, read ACMI. Ownership, fractional interest, and management are conversations about keeping access over time. Crew, engineering, maintenance, and cabin work are support around an aircraft you already have or are about to buy.",
      "You can raise more than one of these in the same note. A purchase often leads to a management question, and a management question often leads to a maintenance or cabin question. EXJET is the coordinator. Operators, lessors, shops, and fractional providers remain responsible for the service they contract to provide. Use the quote form for a trip and the contact form for everything else.",
    ],
  }],
  "/operator-partners": [{
    heading: "What EXJET asks an operator to have ready",
    paragraphs: [
      "An introduction is easier to review when it names the certificate holder, the certificate, the aircraft types you actually operate, and the regions you can cover on short notice. Home base, a commercial contact, and whether you fly passengers, cargo, or both are enough to start. Do not send passenger manifests or unrelated client information. EXJET does not publish your fleet as its own, and an introduction is not a promise of trips.",
      "When a client trip might fit, the review is about that trip: authority, insurance, crew, and the specific aircraft. ARGUS or Wyvern information, if you have it, can be part of the file. It is the operator’s rating, not a certification held by EXJET. The form on this page is the straightforward way to send the introduction. You can also call the Dallas office.",
    ],
  }],
  "/destinations/aspen": [{
    heading: "A practical Aspen request",
    paragraphs: [
      "Aspen trips fail in the details that are easy to leave out: the address in town, the ski equipment, and the time you need to be off the aircraft rather than the time you hope to leave home. Tell EXJET whether the group can use an earlier or later slot, and whether a nearby airport is acceptable if the operator will not propose Aspen for that load or weather. Mountain flying is the carrier’s decision.",
      "Winter holidays and event weekends need more lead time for handling and for the car at the foot of the ramp. Say if you are travelling with children, boots, or a dog. EXJET requests the aircraft and keeps one advisor on the brief. The operator confirms performance, the handler confirms the ramp, and the resort transfer is only as firm as the company you book.",
    ],
  }],
  "/destinations/cabo": [{
    heading: "Resort, airport, and the international brief",
    paragraphs: [
      "Los Cabos requests should name the resort or marina and the airport you expect to use. San José del Cabo and Cabo San Lucas are not interchangeable once the car ride is included. Say whether this is a nonstop from Dallas or another U.S. city, who is travelling, and whether anyone needs a specific arrival for a boat or a wedding. Passport and entry requirements are the passengers’ responsibility. EXJET does not provide immigration advice.",
      "Ask the advisor to show the aircraft category, the operator, and the charges that are known at the time of the quote, including any international handling that has already been identified. The rest is confirmed before you travel. A page like this is a planning note. It is not a reserved crossing or a fare.",
    ],
  }],
  "/partnership": [{
    heading: "What a useful partnership note contains",
    paragraphs: [
      "Introduce the company, the service you actually deliver, and the client situation you can help with. Charter ground transport, maintenance, interiors, insurance, and travel planning are all relevant if they support a trip or an aircraft decision. A general brochure is less useful than one example of how you would work beside EXJET on a named kind of mission, with the commercial terms left for a later conversation.",
      "EXJET does not imply that a conversation is an appointment or an exclusive arrangement. If there is a client already in motion, say so carefully and without sending that client’s private documents until someone asks for them. Use the contact form and mark the note as a partnership. The Dallas office will reply if the fit is worth a call.",
    ],
  }],
  "/crew": [{
    heading: "How a crew brief should be written",
    paragraphs: [
      "State the aircraft type, the base, the start date, and whether the need is a short assignment or an ongoing seat. Add the certificates and experience you believe the role requires, and say whether the aircraft is privately operated or on a certificate. EXJET can organize that brief and make introductions. The employer and the pilot remain responsible for qualifications, training, and the employment or contract terms.",
      "Do not send passport numbers or medical files in the first note. A name, a contact, and the role are enough to see whether an introduction makes sense. If the need is tied to a charter trip rather than a hire, say that. Trip crew are part of the operator’s flight, and the operator assigns them. EXJET does not employ the crew of a brokered charter.",
    ],
  }],
  "/aircraft-charter": [{
    heading: "From the first note to a written option",
    paragraphs: [
      "Passenger and cargo charter use the same first questions. Where does the trip start and end, on what day, and what is moving? For people, that is the count plus anything that affects the cabin or the hold. For freight, it is weight, size, and handling. EXJET takes that brief to licensed third-party carriers and comes back with options that can be compared. The option should name the operator and describe the aircraft well enough to judge the trip.",
      "If the travel is a group, a sports movement, or a shipment out of Dallas, the more specific pages on this site explain what else to include. The quote form is the place to send the itinerary. Calling is better when the departure is soon. Either way, a request is not a booking, and the carrier keeps operational control of the flight.",
    ],
  }],
  "/engineering-stc": [{
    heading: "Keep the engineering scope separate from the sales pitch",
    paragraphs: [
      "A modification brief should say what has to change and why, on which aircraft, and by when the aircraft needs to fly again. Serial number, current equipment, and the documents you already have save a round of questions. EXJET can help you organize that package and coordinate conversations with engineering and installation providers. Those providers determine whether an existing approval applies or whether new work is required.",
      "Ask who will approve the data, who will install it, and how the downtime is estimated. A connectivity or cabin project can sit beside an engineering question. Treat them as related schedules, not as one vague “upgrade.” Nothing on this page is an approval, a price, or a promise that a particular STC fits your serial number.",
    ],
  }],
  "/dry-lease": [{
    heading: "What to define before a dry-lease conversation",
    paragraphs: [
      "A dry lease is the aircraft without the lessor’s crew. The brief should say who will operate it, in which kind of operation, for how many months, and roughly how much it will fly. Home base, maintenance expectations, and insurance responsibilities belong in the first note, because they change which aircraft can even be discussed. EXJET helps structure that request. The lease itself is a contract between the parties, with the operating rules that apply to them.",
      "Do not assume a passenger aircraft and a freighter follow the same path. Say which you need, and whether the term is a season or longer. Delivery condition, return condition, and who schedules maintenance are questions for the draft, not details to discover after the aircraft is chosen. Use the contact form and describe the operation. A trip with crew belongs on the charter form instead.",
    ],
  }],
  "/destinations": [{
    heading: "Use the destination pages as a briefing list",
    paragraphs: [
      "Each destination note is a reminder of what to tell the advisor: the real address, the airport choices, the baggage, and the flexibility in the schedule. Palm Beach, Aspen, Vail, and Cabo are starting points because clients ask for them and because the ground piece changes the flight. They are not a statement that EXJET holds slots or rooms. Hotels, handlers, and cars confirm their own availability.",
      "If your city is not on the list, the quote form is still the right place. Name the address and the date. The Travel Journal is separate reading about how a trip might be spent. It is not a booking service for villas or guides. EXJET’s work is the aircraft request and the coordination around it.",
    ],
  }],
  "/editorial-standards": [{
    heading: "What these pages are not",
    paragraphs: [
      "Guides are written so a client or an assistant can ask better questions. They are not quotes, not flight plans, and not a claim that a pictured aircraft is in EXJET’s fleet. When a page uses a manufacturer figure, it is a reference for the type. The operator of a charter confirms the specific aircraft. When a page mentions ARGUS or Wyvern, it is describing third-party operator information, not a certification held by EXJET.",
      "If a sentence on the site is out of date, or if an airport code or a procedure has changed, write to the contact desk with the page address. Corrections are how the guides stay usable. Prices, if any example appears, are labeled as illustrations. They are not EXJET tariffs.",
    ],
  }],
  "/aircraft-comparisons/challenger-300-vs-challenger-350": [{
    heading: "What to ask for on the quote",
    paragraphs: [
      "Ask the advisor to price your city pair on the aircraft that are actually offered, and to say which type each option is. A Challenger 300 and a Challenger 350 can both be sensible domestic aircraft. The difference that matters is the cabin you will sit in, the baggage you can bring, and the operator’s conditions for your date. Model year alone does not answer that.",
      "If one offer is newer and the other is closer to your departure airport, compare the whole trip, including the drive and the ability to move the time. EXJET will not treat a comparison page as a recommendation of one type. Bring the passenger count and the bags to the quote form and judge the written options.",
    ],
  }],
  "/empty-legs/dallas": [{
    heading: "How to ask for a Dallas empty leg",
    paragraphs: [
      "An empty leg exists only when an operator is repositioning an aircraft and is willing to sell the seats. From Dallas, that might be a departure or an arrival, and it can disappear when the primary trip changes. The useful request names a flexible date, the other city, and the number of people, and it accepts that the aircraft type is whatever is being moved. A fixed minute and a chosen model are a charter request, not an empty leg.",
      "Use the form on this page. EXJET will see whether a current repositioning fits and, if not, can price a normal charter for the same cities. Either result should identify the operator. The price, the rules, and the right to cancel or retime the flight are the operator’s, confirmed before you travel. Nothing listed in general terms on this site is a seat you can hold.",
    ],
  }],
  "/aircraft-comparisons/gulfstream-g650-vs-global-8000": [{
    heading: "Judge the offered aircraft, not the brochure",
    paragraphs: [
      "Both names come up when the trip is very long. The useful comparison is still the offer in front of you: which serial or model is proposed, which operator will fly it, how many people and how much baggage you have, and whether the routing needs a stop. A published range is a reference. It is not a promise that a particular aircraft will fly your city pair nonstop with your load.",
      "EXJET does not claim to own or manage a Global 8000 or a G650. If one appears in a quote, it is because a licensed carrier proposed it. Ask for the cabin layout that aircraft actually has, not the layout in a brochure, and for the charges that make up the trip. Then choose.",
    ],
  }],
  "/aircraft-comparisons/challenger-350-vs-citation-latitude": [{
    heading: "A domestic trip, two different cabins",
    paragraphs: [
      "On many U.S. city pairs both types can be discussed. Start with how many people need to work, how much baggage is in the hold, and whether you care more about cabin cross-section or about the airports you want to use. Those points decide the conversation faster than a category label. Ask for at least one option of each only if both are realistic for the date. Otherwise you will compare brochures instead of offers.",
      "The quote should say which type is proposed and which operator will fly it. Range and cabin figures published for the type are planning references. The carrier confirms the aircraft you would actually board. Send the cities, the date, and the passenger count on the quote form when you are ready.",
    ],
  }],
  "/acmi": [{
    heading: "Write the ACMI need as an operation, not a slogan",
    paragraphs: [
      "Say whether you need passenger seats or cargo volume, for which season or contract, and in which region. Add the aircraft category you think fits, the hours you expect, and whether the crew must already be approved for your operation. ACMI means the provider brings the aircraft, the crew, the maintenance, and the insurance described in the agreement. The agreement, not this page, defines each of those words.",
      "EXJET can help you prepare that request and coordinate the commercial conversation. The operating carrier remains the operator. If what you need is a single trip, use the charter form. If you need the aircraft only, and your own crew will fly it, read the dry-lease page instead. Mixing those requests produces a quote for the wrong product.",
    ],
  }],
  "/guides/argus-wyvern": [{
    heading: "What to ask EXJET to check",
    paragraphs: [
      "When you request a trip, you can ask that the proposed operator’s current ARGUS or Wyvern information be included in the review, if that operator participates. Ask what the designation is, what it covers, and the date of the information. A logo on a slide is not the same thing as a trip-specific confirmation of the company that will operate your flight. Legal authority to fly the trip is a separate question and comes first.",
      "EXJET does not hold an ARGUS or Wyvern rating, and it does not become certified because a carrier it arranges does. The rating, when it exists, belongs to the operator. If a program is a requirement for your company, say so in the quote notes so aircraft can be sourced with that constraint in view. The safety page states the same limit in shorter form.",
    ],
  }],
};
