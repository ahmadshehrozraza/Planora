import { hc } from "hono/client";

import { AppRoute, AppType } from "@/app/api/[[...route]]/route";

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!);

export const client2 = hc<AppRoute>(process.env.NEXT_PUBLIC_APP_URL!) as any;