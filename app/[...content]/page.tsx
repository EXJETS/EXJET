import { isRetiredPublicPath } from "@/data/public-route-retirements";
import { notFound } from "next/navigation";
import { contentPages,getContentPage } from "@/data/editorial";
import { EditorialPage } from "@/components/EditorialPage";
import { buildDynamicMetadata } from "@/data/seo";
type Props={params:Promise<{content:string[]}>};
export const dynamicParams=false;
export function generateStaticParams(){return contentPages.filter(page=>!["/privacy","/terms"].includes(page.path) && !isRetiredPublicPath(page.path)).map(page=>({content:page.path.split("/").filter(Boolean)}));}
async function getRoutableContent(params: Props["params"]) {
  const path = "/" + (await params).content.join("/");
  return isRetiredPublicPath(path) ? undefined : getContentPage(path);
}
export async function generateMetadata({params}:Props){const page=await getRoutableContent(params);return page ? buildDynamicMetadata({path:page.path,title:page.seoTitle || `${page.title.replace(/\.$/,"")} | EXJET`,description:page.description,image:page.image?.src,noindex:page.noindex || page.draft,type:page.kind === "article" ? "article" : "website",published:page.published,updated:page.updated}):{};}
export default async function ContentRoute({params}:Props){const page=await getRoutableContent(params);if(!page)notFound();return <EditorialPage page={page} />;}
