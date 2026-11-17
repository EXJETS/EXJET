import { EditorialPage } from "@/components/EditorialPage";
import { getContentPage } from "@/data/editorial";
import { buildMetadata } from "@/data/seo";
export const metadata=buildMetadata("/privacy",{noindex:true});
export default function PrivacyPage(){return <EditorialPage page={getContentPage("/privacy")!} />;}
