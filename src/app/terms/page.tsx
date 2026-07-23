import { LegalPage } from "@/components/legal/legal-page";
import { termsContent } from "@/content/legal/terms";

export const metadata = {
  title: "Terms of Use",
};

export default function TermsOfUsePage() {
  return <LegalPage content={termsContent} />;
}
