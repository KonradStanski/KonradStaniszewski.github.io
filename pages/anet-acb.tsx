import dynamic from "next/dynamic";
import { Page } from "@/components/Page";

const AnetAcbApp = dynamic(
  () => import("@/components/anet-acb/AnetAcbApp"),
  { ssr: false }
);

function AnetAcbPage() {
  return (
    <Page
      title="ANET ACB Calculator"
      description="Canadian Adjusted Cost Base & Capital Gains for Arista Networks (ANET) RSU & ESPP. All processing happens in your browser."
    >
      <AnetAcbApp />
    </Page>
  );
}

AnetAcbPage.fullWidth = true;

export default AnetAcbPage;
