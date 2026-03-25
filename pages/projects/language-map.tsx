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
            Enter the languages you speak below to see which countries you can
            visit and communicate with locals.
          </p>
        </section>

        <section>
          <LanguageMap />
        </section>
      </div>
    </Page>
  );
};

export default LanguageMapPage;
