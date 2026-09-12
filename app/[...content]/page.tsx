import { notFound } from "next/navigation";
import { contentPages,getContentPage } from "@/data/editorial";
import { EditorialPage } from "@/components/EditorialPage";
import { buildDynamicMetadata } from "@/data/seo";
type Props={params:Promise<{content:string[]}>};
export const dynamicParams=false;
export function generateStaticParams(){return contentPages.filter(page=>!["/privacy","/terms"].includes(page.path)).map(page=>({content:page.path.split("/").filter(Boolean)}));}
export async function generateMetadata({params}:Props){const page=getContentPage("/"+(await params).content.join("/"));return page ? buildDynamicMetadata({path:page.path,title:`${page.title.replace(/\.$/,"")} | EXJET`,description:page.description,image:page.image?.src,noindex:page.noindex}):{};}
export default async function ContentRoute({params}:Props){const page=getContentPage("/"+(await params).content.join("/"));if(!page)notFound();return <EditorialPage page={page} />;}
