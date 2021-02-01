import ReactIcon from "./svgs/react";

const skills = [
  {
    text: "React",
    icon: ReactIcon
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
