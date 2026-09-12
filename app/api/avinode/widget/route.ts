import { widgetResponse } from "@/integration/avinode/widget";
import widgetConfig from "@/integration/avinode/widget-config.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return widgetResponse(request, process.env.AVINODE_WEB_APP_URL?.trim() || widgetConfig.bootstrapUrl);
}
