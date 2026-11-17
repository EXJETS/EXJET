import { EditorialPage } from "@/components/EditorialPage";
import { getContentPage } from "@/data/editorial";
import { buildMetadata } from "@/data/seo";
export const metadata=buildMetadata("/terms",{noindex:true});
export default function TermsPage(){return <EditorialPage page={getContentPage("/terms")!} />;}
