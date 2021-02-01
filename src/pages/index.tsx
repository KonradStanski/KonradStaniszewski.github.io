import Link from "next/link";
import Header from "../components/header";
import ExtLink from "../components/ext-link";
import Skills from "../components/skills";
import GitHub from "../components/svgs/github";
import sharedStyles from "../styles/shared.module.css";

export default () => (
  <>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <h1>Konrad Staniszewski</h1>
      <h2>Adventures in software engineering</h2>
      <img src="/headshot.png" height="85" width="250" alt="Headshot" />

      <div className="home-text">
        <p>
          Hi, I'm <b>Konrad Staniszewski</b>, a third year computer engineering
          student at the Univeristy of Alberta.
        </p>
        <p>
          I'm interested in web development, data visualization, machine
          learning, embedded systems, networking, quantum computing, 3D
          printing, physics, electronics, and many outdoor sports.
        </p>
      </div>
      <Skills />
    </div>
  </>
);
