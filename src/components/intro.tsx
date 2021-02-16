import styles from "./styles/intro.module.css";

export default () => {
  return (
    <div className="intro">
      <div className="intro-text">
        <p>
          Hi, I'm <b>Konrad Staniszewski</b>, a fourth year computer engineering
          student at the Univeristy of Alberta.
        </p>
        <p>
          I'm interested in web development, data visualization, machine
          learning, embedded systems, networking, quantum computing, 3D
          printing, physics, electronics, and many outdoor sports.
        </p>
      </div>
      <img
        src="/headshot.jpg"
        height="85"
        width="250"
        alt="Headshot"
        style={{ borderRadius: "50%" }}
      />
    </div>
  );
};
