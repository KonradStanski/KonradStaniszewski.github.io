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
        <section className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use the slider to adjust the temperature. Watch how the system
              behaves at different temperatures!
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SuperConductor />
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
};

export default SuperConductorPage;
