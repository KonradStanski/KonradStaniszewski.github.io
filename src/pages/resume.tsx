import Header from "../components/header";

import sharedStyles from "../styles/shared.module.css";

import React from "react";
import IframeResizer from "iframe-resizer-react";

export default () => (
  <>
    <Header titlePre="Projects" />
    <div className={sharedStyles.layout}>
      <IframeResizer
        src="/resume.pdf"
        style={{ display: "block", margin: "auto" }}
      />
    </div>
  </>
);
