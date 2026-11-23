import { AccountPreview } from "@/components/AccountPreview";
import { buildMetadata } from "@/data/seo";

export const metadata = buildMetadata("/account");

export default function AccountPage() { return <AccountPreview />; }
