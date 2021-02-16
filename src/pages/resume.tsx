import Header from "../components/header";

import sharedStyles from "../styles/shared.module.css";

import React from "react";
// import IframeResizer from "iframe-resizer-react";
import dynamic from "next/dynamic";

// import { Document } from "react-pdf"

const PdfViewer = dynamic(() => import("../components/PdfViewer"), {
  ssr: false
});

export default () => (
  <>
    <Header titlePre="Resume" />
    <div className={sharedStyles.layout}>
      <div
        style={{
          display: "flex",
          justifyContent: "center"
        }}
      >
        <PdfViewer file="/resume.pdf" width={800} pageNumber={1} />
      </div>
    </div>
  </>
);
