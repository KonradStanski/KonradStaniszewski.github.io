import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <div className="m-auto px-4 md:px-10">
        <h1 className="text-center text-5xl font-bold pb-10 pt-0 md:pt-10">Konrad Staniszewski</h1>
        <div id="intro-section" className="py-5 flex flex-col md:flex md:flex-row">
          <div className="flex flex-col text-xl justify-around">
            <p>
              Hi, I'm <b>Konrad Staniszewski</b>, a Software Engineering grad from the University of Alberta.
              Currently working at Arista.
            </p>
            <br/>
            <p>
              Some things about me:
            </p>
            <ul className="list-disc mx-6">
              <li>
                I grew up in Edmonton, Alberta.
                <a className="text-sky-400" href="https://www.cbc.ca/news/canada/edmonton/edmonton-cold-record-environment-canada-1.7083387"> (very cold winters)</a>
              </li>
              <li>As a kid, tearing various things apart made me fall in love with how things worked, and more importantly: how they are made.</li>
              <li>Made my first money by replacing capacitors from trashed audio amps and re-selling them on facebook marketplace.</li>
              <li>
                Making Arduino robots introduced me to software years before I realized I wanted to be a software engineer.
                My motivation for learning to code was getting my robots to move.
              </li>
            </ul>
            <br/>
            <p>A few things I believe:</p>
            <ul className="list-disc mx-6">
              <li>
                Advancing technology (<a className="text-sky-400" href="https://en.wikipedia.org/wiki/the_beginning_of_infinity">knowledge</a>)
                is our duty and right.
              </li>
              <li>Form ≹ Function.</li>
              <li>
                <a className="text-sky-400" href="/images/raptor-engine.jpg">Good engineering </a>
                can be as moving as a piece of <a className="text-sky-400" href="https://en.wikipedia.org/wiki/Henri-Paul_Motte#/media/File:Vercing%C3%A9torix_se_rend_%C3%A0_C%C3%A9sar_1886_HPMotte.jpg">art</a> or music.</li>
              <li>There are many lessons to learn from history.</li>
              <li>Paul Graham's <a className="text-sky-400" href="https://www.paulgraham.com/articles.html">essays</a> deserve your attention.</li>
              <li>Life is best lived enjoyed 🙂</li>
            </ul>
            <br/>
            <p>Things inspiring me right now:</p>
            <ul className="list-disc mx-6">
              <li><a className="text-sky-400" href="https://www.palladiummag.com/2023/08/16/the-only-reason-to-explore-space/">Why should we reach for the stars?</a></li>
              <li><a className="text-sky-400" href="https://www.piratewires.com/p/techno-industrialist-manifesto">The techno-industrialist manifesto</a></li>
            </ul>
            <br/>
            <p>Check out my <a className="text-sky-400" href="/blog/">blog</a> posts!</p>
            <p>Reach me: konrad.a.staniszewski (at) gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
