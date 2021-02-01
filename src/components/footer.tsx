import sharedStyles from "../styles/shared.module.css";
import contactStyles from "../styles/contact.module.css";
import ExtLink from "../components/ext-link";

import GitHub from "../components/svgs/github";
import Envelope from "../components/svgs/envelope";
import LinkedIn from "../components/svgs/linkedin";

const contacts = [
  {
    Comp: GitHub,
    alt: "github icon",
    link: "https://github.com/KonradStanski"
  },
  {
    Comp: LinkedIn,
    alt: "linkedin icon",
    link: "https://www.linkedin.com/in/konradstanski/"
  },
  {
    Comp: Envelope,
    alt: "envelope icon",
    link: "mailto:konrad.a.staniszewski@gmail.com?subject=Website"
  }
];

export default () => (
  <>
    <footer>
      <div className={sharedStyles.layout}>
        <div className={contactStyles.name}>
          Konrad Staniszewski - Student @ University of Alberta
        </div>

        <div className={contactStyles.links}>
          {contacts.map(({ Comp, link, alt }) => {
            return (
              <ExtLink key={link} href={link} aria-label={alt}>
                <Comp height={32} />
              </ExtLink>
            );
          })}
        </div>
      </div>
    </footer>
  </>
);
