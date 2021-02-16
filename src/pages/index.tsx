import Link from "next/link";
import Header from "../components/header";
import ExtLink from "../components/ext-link";
import Skills from "../components/skills";
import sharedStyles from "../styles/shared.module.css";
import Intro from "../components/intro";

export default () => (
  <>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <h1>Konrad Staniszewski</h1>
      <Intro />
      <Skills />
    </div>
  </>
);
