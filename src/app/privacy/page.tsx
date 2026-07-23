import { LegalPage } from "@/components/legal/legal-page";
import { privacyContent } from "@/content/legal/privacy";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return <LegalPage content={privacyContent} />;
}
