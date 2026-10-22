import { AircraftExplorer } from "@/components/AircraftExplorer";
import { PortalIntro } from "@/components/portal/PortalAccess";
import { aircraft } from "@/data/aircraft";
export const metadata = { title: "Explore aircraft" };
export default function AircraftApp(){return <><PortalIntro title="Find the cabin that fits." description="Explore aircraft profiles and compare up to three options before discussing your mission with EXJET." /><AircraftExplorer items={aircraft} /></>;}
