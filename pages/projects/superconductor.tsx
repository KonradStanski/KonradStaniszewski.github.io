import type { NextPage } from "next";
import { Page } from "@/components/Page";
import dynamic from "next/dynamic";

const SuperConductor = dynamic(() => import("@/components/SuperConductor"), {
  ssr: false,
});

const SuperConductorPage: NextPage = () => {
  return (
    <Page
      title="Superconductor Simulator"
      description="Interactive simulation of Type I superconductor using XY Monte Carlo model"
    >
      <div className="space-y-6">
        <section>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            This is a visual representation of the quantum phase states of
            cooper pair bonding present within a Type I superconductor.
          </p>
        </section>

        <section className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use the slider above the visualization to adjust the temperature.
              Watch how the system behaves at different temperatures!
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SuperConductor />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What is Superconductivity?</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Superconductivity is a state that certain materials can take where
              they have zero electrical resistance. This has some interesting
              side effects, the most prominent being that superconductors repel
              magnetic fields. These superconducting states are normally
              achieved at super low temperatures.
            </p>
            <p>
              The holy grail of superconductivity would be a room-temperature
              superconductor with applications in almost all aspects of day to
              day life.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">The XY Monte Carlo Model</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              This simulation uses the XY Monte Carlo random sampling method to
              get a running time that is reasonable on a modern PC. Running a
              perfect simulation of a Type I superconductor without this
              statistical approximation would require the computing strength of
              a supercomputer.
            </p>
            <p>
              The XY model considers how each relative energy state interacts
              with its four nearest neighbors. The arrows represent the quantum
              phase angles of cooper pairs, and the red color intensity
              indicates the relative energy of each site.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How it Works</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                Generate a lattice with &quot;rotors&quot; with random phase
                angles indicating the relative quantum energy state of the
                cooper pairs
              </li>
              <li>
                Specify the temperature of the &quot;heat bath&quot; (use the
                slider)
              </li>
              <li>
                Choose a random lattice site and a random new possible phase
                for the rotor
              </li>
              <li>
                Calculate the energy difference between this site and its 4
                nearest neighbors
              </li>
              <li>
                If the change in energy ΔE ≤ 0, accept the move. If ΔE &gt; 0,
                accept with probability e^(-ΔE/kT)
              </li>
              <li>Repeat continuously</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">About This Project</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              This simulation was created as part of my experience at ISSYP
              (International Summer School for Young Physicists) at Perimeter
              Institute, where I studied solid-state physics with a focus on
              superconductors under the guidance of researcher Lauren Hayward
              Sierens.
            </p>
            <p>
              The Monte Carlo random sampling method is a powerful tool that
              allows semi-accurate approximations to help develop an intuition
              for what is occurring physically in these quantum systems.
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
};

export default SuperConductorPage;
