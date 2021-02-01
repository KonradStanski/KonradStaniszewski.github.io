import ReactIcon from "./svgs/react";
import JavascriptIcon from "./svgs/javascript";
import HtmlIcon from "./svgs/html5";
import CssIcon from "./svgs/css3";
import PythonIcon from "./svgs/python";
import CplusplusIcon from "./svgs/cplusplus";
import JavaIcon from "./svgs/java";
import AndroidIcon from "./svgs/android";
import SQLiteIcon from "./svgs/sqlite";
import GitIcon from "./svgs/git";
import LinuxIcon from "./svgs/linux";
import ReduxIcon from "./svgs/redux";

const skills = [
  {
    text: "React",
    icon: ReactIcon
  },
  {
    text: "Javascript",
    icon: JavascriptIcon
  },
  {
    text: "HTML",
    icon: HtmlIcon
  },
  {
    text: "CSS",
    icon: CssIcon
  },
  {
    text: "Python",
    icon: PythonIcon
  },
  {
    text: "C++",
    icon: CplusplusIcon
  },
  {
    text: "Java",
    icon: JavaIcon
  },
  {
    text: "Android",
    icon: AndroidIcon
  },
  {
    text: "SQLite",
    icon: SQLiteIcon
  },
  {
    text: "Git",
    icon: GitIcon
  },
  {
    text: "Linux",
    icon: LinuxIcon
  },
  {
    text: "Redux",
    icon: ReduxIcon
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
