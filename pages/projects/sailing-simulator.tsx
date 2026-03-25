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
        <section className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <SailingSimulator />
        </section>
      </div>
    </Page>
  );
};

export default SailingSimulatorPage;
