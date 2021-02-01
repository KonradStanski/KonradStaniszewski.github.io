import Lightning from "./svgs/lightning";
import Jamstack from "./svgs/jamstack";
import Wifi from "./svgs/wifi";
import Lighthouse from "./svgs/lighthouse";
import Plus from "./svgs/plus";
import Notion from "./svgs/notion";
import Edit from "./svgs/edit";
import Scroll from "./svgs/scroll";
import Test from "./svgs/react";

const skills = [
  {
    text: "React",
    icon: Test
  },
  {
    text: "JAMstack based",
    icon: Jamstack
  },
  {
    text: "Always available",
    icon: Wifi
  },
  {
    text: "Customizable",
    icon: Edit
  },
  {
    text: "Incremental SSG",
    icon: Plus
  },
  {
    text: "MIT Licensed",
    icon: Scroll
  },
  {
    text: "Edit via Notion",
    icon: Notion
  },
  {
    text: "Great scores",
    icon: Lighthouse
  }
];

export default () => (
  <div className="skills">
    {skills.map(({ text, icon: Icon }) => (
      <div className="skill" key={text}>
        {Icon && <Icon height={24} width={24} />}
        <h4>{text}</h4>
      </div>
    ))}
  </div>
);
