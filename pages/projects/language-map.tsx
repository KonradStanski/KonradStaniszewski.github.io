import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Page } from "@/components/Page";

const LanguageMap = dynamic(() => import("@/components/LanguageMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
});

const LanguageMapPage: NextPage = () => {
  return (
    <Page
      title="Where Can You Communicate?"
      description="Interactive world map showing countries where you can travel and be understood based on the languages you speak"
    >
      <div className="space-y-6">
        <section>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Planning a trip but worried about language barriers? Enter the languages
            you speak below to see which countries you can visit and still communicate
            with locals. The map highlights countries where your languages are spoken
            officially or widely understood.
          </p>
        </section>

        <section>
          <LanguageMap />
        </section>

        <section className="prose dark:prose-invert max-w-none">
          <h2>How It Works</h2>
          <p>
            This tool maps over 200 countries to the languages commonly spoken there.
            Languages include both official languages and those widely spoken or
            understood by the local population. For example, English is included for
            countries where it&apos;s commonly used in tourism and business, even if
            it&apos;s not an official language.
          </p>

          <h2>Understanding the Results</h2>
          <ul>
            <li>
              <strong>Green countries</strong> indicate places where at least one of
              your languages is spoken. Darker green means more of your languages
              are understood there.
            </li>
            <li>
              <strong>Gray countries</strong> represent potential language barriers.
              You may still be able to visit, but communication could be more challenging.
            </li>
            <li>
              <strong>Hover over any country</strong> to see which languages are spoken
              there and which ones match your selection.
            </li>
          </ul>

          <h2>Tips for Travelers</h2>
          <ul>
            <li>
              <strong>English</strong> is widely understood in tourism areas of most
              countries, even those not highlighted.
            </li>
            <li>
              <strong>Learning basic phrases</strong> in the local language goes a
              long way, even if you&apos;re not fluent.
            </li>
            <li>
              Consider <strong>regional variations</strong> - for example, Brazilian
              Portuguese and European Portuguese have differences.
            </li>
            <li>
              Major cities typically have more English speakers than rural areas.
            </li>
          </ul>

          <h2>About the Data</h2>
          <p>
            Language data is compiled from various sources and includes both official
            languages and those widely spoken in each country. The data focuses on
            practical communication rather than just official status, so languages
            commonly used in business, tourism, and daily life are included.
          </p>
          <p>
            Map data is provided by{" "}
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
              OpenStreetMap
            </a>{" "}
            contributors and{" "}
            <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">
              CARTO
            </a>.
            Country boundaries use{" "}
            <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">
              Leaflet
            </a>{" "}
            with GeoJSON data.
          </p>
        </section>
      </div>
    </Page>
  );
};

export default LanguageMapPage;
