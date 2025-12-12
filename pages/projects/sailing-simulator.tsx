import type { NextPage } from "next";
import { Page } from "@/components/Page";
import dynamic from "next/dynamic";

const SailingSimulator = dynamic(() => import("@/components/SailingSimulator"), {
  ssr: false,
});

const SailingSimulatorPage: NextPage = () => {
  return (
    <Page
      title="Sailing Simulator"
      description="Interactive physics simulation demonstrating how sailboats can sail upwind"
    >
      <div className="space-y-6">
        <section>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Ever wondered how a sailboat can sail upwind? This interactive
            simulator demonstrates the physics that make it possible!
          </p>
        </section>

        <section className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <SailingSimulator />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How Does Sailing Work?</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Sailing upwind seems counterintuitive - how can a boat move
              against the wind? The secret lies in three key components:
            </p>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                <strong>The Sail as an Airfoil:</strong> When wind hits the
                sail at an angle, it acts like an airplane wing, creating
                &quot;lift&quot; perpendicular to the sail surface. This is the
                primary force that propels the boat.
              </li>
              <li>
                <strong>The Keel:</strong> The keel (underwater fin) provides
                massive resistance to sideways motion while allowing forward
                motion. This is crucial - without the keel, the boat would just
                slide sideways!
              </li>
              <li>
                <strong>Vector Addition:</strong> The lift force from the sail
                has components both forward and sideways. The keel blocks the
                sideways component, leaving only the forward component to push
                the boat ahead.
              </li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Understanding Apparent Wind</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              One of the most important concepts in sailing is{" "}
              <strong>apparent wind</strong> - the wind that the boat actually
              experiences, which is different from the true wind!
            </p>
            <p>
              <strong>Apparent Wind = True Wind - Boat Velocity</strong>
            </p>
            <p>
              As the boat moves, it creates its own &quot;wind&quot; in the
              opposite direction of motion (like feeling wind when you ride a
              bike on a calm day). This combines with the true wind to create
              the apparent wind.
            </p>
            <p>
              In the simulator, watch how:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>The green arrow shows the apparent wind (what the sail feels)</li>
              <li>The blue arrow shows the true wind (actual environmental wind)</li>
              <li>The red arrow shows the boat&apos;s velocity</li>
              <li>
                As the boat speeds up, the apparent wind shifts forward, which
                is why you must continuously adjust your sail trim!
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Controls</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <strong>Sail Trim (0° - 90°):</strong>
              <p className="ml-4">
                Controls the angle of the sail relative to the boat centerline.
                Tighter trim (smaller angle) is needed when sailing closer to
                the wind. Looser trim (larger angle) is better when sailing
                with the wind at your back.
              </p>
            </div>
            <div>
              <strong>Rudder (-45° to +45°):</strong>
              <p className="ml-4">
                Controls the steering. The rudder creates a turning force
                proportional to the boat&apos;s speed through the water. Positive
                angles turn the boat clockwise, negative angles turn
                counterclockwise.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Points of Sail</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>Different wind angles require different sailing techniques:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Close-hauled (30°-45° from wind):</strong> Sailing as
                close to upwind as possible. Requires tight sail trim (15°-20°).
                This is where the keel is most important!
              </li>
              <li>
                <strong>Beam reach (90° from wind):</strong> Wind coming from
                the side. Generally the fastest point of sail. Moderate sail
                trim (45°-60°).
              </li>
              <li>
                <strong>Broad reach (135° from wind):</strong> Wind from
                behind and to the side. Loose sail trim (60°-80°).
              </li>
              <li>
                <strong>Running (180° from wind):</strong> Wind directly
                behind. Maximum sail trim (80°-90°). Slower than you might
                think!
              </li>
            </ul>
            <p>
              <strong>No-Go Zone:</strong> You cannot sail directly into the
              wind (0°-30°). The sail cannot generate lift when the wind is too
              close to straight ahead. Try it in the simulator - you&apos;ll
              just slow down!
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Physics Implementation</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>This simulator models:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Sail aerodynamics:</strong> Lift and drag forces based
                on angle of attack (angle between apparent wind and sail)
              </li>
              <li>
                <strong>Keel hydrodynamics:</strong> 98% resistance to lateral
                motion, simulating the keel&apos;s effectiveness
              </li>
              <li>
                <strong>Hull drag:</strong> Water resistance proportional to
                velocity squared
              </li>
              <li>
                <strong>Rudder forces:</strong> Turning torque proportional to
                water flow speed
              </li>
              <li>
                <strong>Apparent wind:</strong> Continuously updated based on
                boat velocity
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Try This!</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <ol className="list-decimal ml-6 space-y-3">
              <li>
                <strong>Sail upwind:</strong> Turn the boat to point as close
                to the wind direction (shown in top right) as you can. Set sail
                trim to about 20°. Use the rudder to maintain heading. Notice
                how you&apos;re moving forward despite the wind blowing against
                you!
              </li>
              <li>
                <strong>Watch the vectors:</strong> Pay attention to how the
                green apparent wind vector shifts as you speed up. This is why
                sailors constantly adjust their sails!
              </li>
              <li>
                <strong>Tacking:</strong> To reach a point directly upwind, you
                must &quot;tack&quot; - sail at 45° to one side, then turn through
                the wind and sail 45° to the other side, zigzagging your way
                upwind.
              </li>
              <li>
                <strong>Feel the power:</strong> Try a beam reach (90° to
                wind) with sail trim around 50°. This is often the fastest and
                most powerful point of sail!
              </li>
            </ol>
          </div>
        </section>
      </div>
    </Page>
  );
};

export default SailingSimulatorPage;
