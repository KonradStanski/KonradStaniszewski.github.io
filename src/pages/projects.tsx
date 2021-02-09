import Header from "../components/header";
import ExtLink from "../components/ext-link";

import sharedStyles from "../styles/shared.module.css";

export default () => (
  <>
    <Header titlePre="Projects" />
    <div className={sharedStyles.layout}>
      <h2>
        <ExtLink href="https://github.com/konradStanski">
          Please check out my projects on GitHub while I work on adding them to
          this page!
        </ExtLink>
      </h2>
    </div>
  </>
);
