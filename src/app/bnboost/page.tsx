import { BnboostNavbar } from "@/components/bnboost/navbar";
import { BnboostHero } from "@/components/bnboost/hero";
import { BnboostProblem } from "@/components/bnboost/problem";
import { BnboostSolution } from "@/components/bnboost/solution";
import { BnboostShowcase } from "@/components/bnboost/showcase";
import { BnboostHowItWorks } from "@/components/bnboost/how-it-works";
import { BnboostResults } from "@/components/bnboost/results";
import { BnboostTestimonial } from "@/components/bnboost/testimonial";
import { BnboostFinalCta } from "@/components/bnboost/final-cta";
import { BnboostFooter } from "@/components/bnboost/footer";

export default function BnboostLandingPage() {
  return (
    <>
      <BnboostNavbar />
      <main>
        <BnboostHero />
        <BnboostProblem />
        <BnboostSolution />
        <BnboostShowcase />
        <BnboostHowItWorks />
        <BnboostResults />
        <BnboostTestimonial />
        <BnboostFinalCta />
      </main>
      <BnboostFooter />
    </>
  );
}
