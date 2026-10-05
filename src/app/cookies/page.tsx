import { LegalPage } from "@/components/legal/legal-page";
import { cookiesContent } from "@/content/legal/cookies";

export const metadata = {
  title: "Cookie Policy",
};

export default function CookiePolicyPage() {
  return <LegalPage content={cookiesContent} />;
}
