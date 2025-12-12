import type { NextPage } from "next";
import { Page } from "@/components/Page";
import Link from "next/link";
import { cx } from "@/lib/utils";

interface Project {
  title: string;
  slug: string;
  description: string;
  status: "active" | "coming-soon";
}

const projects: Project[] = [
  {
    title: "Sailing Simulator",
    slug: "sailing-simulator",
    description: "Interactive physics simulation showing how sailboats can sail upwind using lift and keel resistance",
    status: "active",
  },
  {
    title: "Superconductor Simulator",
    slug: "superconductor",
    description: "Interactive simulation of Type I superconductor using XY Monte Carlo model",
    status: "active",
  },
  {
    title: "University GPA Calculator",
    slug: "gpa-calculator",
    description: "Calculate your University of Alberta GPA from your transcript with interactive charts",
    status: "active",
  },
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const isActive = project.status === "active";

  const card = (
    <div
      className={cx(
        "p-6 border rounded-lg transition-all",
        "border-gray-300 dark:border-gray-600",
        isActive
          ? "bg-white dark:bg-gray-800 hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
          : "bg-gray-100 dark:bg-gray-900 opacity-75"
      )}
    >
      <div className="flex items-start justify-between">
        <h3 className={cx("text-xl font-bold", isActive && "text-sky-600 dark:text-sky-400")}>
          {project.title}
        </h3>
        {!isActive && (
          <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
            Coming Soon
          </span>
        )}
      </div>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{project.description}</p>
    </div>
  );

  if (isActive) {
    return (
      <Link href={`/projects/${project.slug}`}>
        {card}
      </Link>
    );
  }

  return card;
};

const Projects: NextPage = () => {
  return (
    <Page
      title="Projects"
      description="Fun interactive projects and experiments built with React and JavaScript"
    >
      <div className="space-y-6">
        <section>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            This is my playground for fun side projects and interactive experiments.
            Click on any active project below to try it out!
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </section>
      </div>
    </Page>
  );
};

export default Projects;
