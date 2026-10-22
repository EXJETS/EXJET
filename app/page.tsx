import { ExperienceHome } from '@/components/portal/ExperienceHome';
import { ContentCollection } from '@/components/EditorialPage';
import { ServicesGrid } from '@/components/ServicesGrid';
import { StructuredData } from '@/components/StructuredData';
import { buildMetadata } from '@/data/seo';
import { localBusinessJsonLd } from '@/data/site';
import { routePaths, articlePaths } from '@/data/editorial';
export const metadata = buildMetadata('/');
export default function Home(){return <><StructuredData data={localBusinessJsonLd()}/><ExperienceHome publicPage/><section className="ex-section ex-section--silver"><div className="ex-container"><div className="ex-section-heading"><div><p className="ex-identity-eyebrow">BEYOND THE JOURNEY</p><h2>A complete aviation relationship.</h2></div></div><ServicesGrid/></div></section><ContentCollection paths={routePaths.slice(0,4)} title="A world within reach." description="Get to know the routes and airports behind your next itinerary."/><ContentCollection paths={['/private-jet-charter/dallas','/pricing','/safety',...articlePaths.slice(0,3)]} title="A clearer view of private aviation." description="Practical guidance for a considered journey." showImages={false}/></>;}
