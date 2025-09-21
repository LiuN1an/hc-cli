import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { EnvContext, UserContext } from "~/context";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "多商户平台 - Multi-Vendor Marketplace" },
    { name: "description", content: "欢迎来到多商户电商平台!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  const { cloudflare } = context.get(EnvContext);

  // 获取当前用户（如果已认证）
  let user = null;
  try {
    user = context.get(UserContext);
  } catch (e) {
    // 用户未认证
  }

  return {
    message: cloudflare.env.VALUE_FROM_CLOUDFLARE,
    user,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Button variant="outline">123</Button>
      <Welcome message={loaderData.message} user={loaderData.user} />
    </>
  );
}
