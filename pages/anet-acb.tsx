import fs from "fs/promises";
import path from "path";
import dynamic from "next/dynamic";
import type { GetStaticProps } from "next";
import { Page } from "@/components/Page";

interface AnetAcbPageProps {
  etradeDownloadScript: string;
}

const AnetAcbApp = dynamic(
  () => import("@/components/anet-acb/AnetAcbApp"),
  { ssr: false }
);

function AnetAcbPage({ etradeDownloadScript }: AnetAcbPageProps) {
  return (
    <Page
      title="ANET ACB Calculator"
      description="Canadian Adjusted Cost Base & Capital Gains for Arista Networks (ANET) RSU & ESPP. All processing happens in your browser."
    >
      <AnetAcbApp etradeDownloadScript={etradeDownloadScript} />
    </Page>
  );
}

AnetAcbPage.fullWidth = true;

export const getStaticProps: GetStaticProps<AnetAcbPageProps> = async () => {
  const liveScriptPath = path.join(
    process.cwd(),
    "components",
    "anet-acb",
    "tampermonkey",
    "etrade-download.user.js",
  );

  const liveScript = await fs.readFile(liveScriptPath, "utf8");
  const versionMatch = liveScript.match(/const SCRIPT_VERSION = "([^"]+)"/);
  const scriptVersion = versionMatch?.[1] || "dev";

  const metadata = `// ==UserScript==
// @name         E*Trade Download - ACB Helper
// @namespace    http://tampermonkey.net/
// @version      ${scriptVersion}
// @description  Persistent toolbar for E*Trade stock plan and trade confirmation PDF downloads
// @match        https://us.etrade.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

`;

  const etradeDownloadScript = `${metadata}${liveScript}`;

  return {
    props: {
      etradeDownloadScript,
    },
  };
};

export default AnetAcbPage;
