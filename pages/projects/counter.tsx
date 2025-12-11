import type { NextPage } from "next";
import { Page } from "@/components/Page";
import { useState } from "react";

const InteractiveCounter: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 border rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-xl font-semibold mb-4">Interactive Counter Demo</h3>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        This is a sample React component to demonstrate the projects section.
        Click the buttons below to interact!
      </p>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Decrease
        </button>
        <span className="text-3xl font-bold">{count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Increase
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const Counter: NextPage = () => {
  return (
    <Page
      title="Interactive Counter"
      description="A simple counter demo built with React hooks"
    >
      <div className="space-y-6">
        <section>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            This is a simple demonstration of React state management using the useState hook.
            The counter maintains its state as you interact with it.
          </p>
        </section>

        <InteractiveCounter />

        <section>
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-2">
            <p>
              This component uses React&apos;s <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">useState</code> hook
              to manage the counter value. Each button click triggers a state update, causing the component to re-render
              with the new value.
            </p>
            <p>
              The three buttons demonstrate different state update patterns: increment, decrement, and reset.
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
};

export default Counter;
