import { Twitter, GitHub, Linkedin } from "react-feather";
import siteConfig from "@/data/siteConfig";
import { cx } from "@/lib/utils";

const iconProps = { className: "w-4 h-4" };

const SOCIAL_ICONS: { [key: string]: React.ReactNode } = {
  twitter: <Twitter {...iconProps} />,
  github: <GitHub {...iconProps} />,
  linkedin: <Linkedin {...iconProps} />,
};

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-8">
      {siteConfig.social ? (
        <ul className="flex justify-center items-center space-x-4">
          <p>Konrad Staniszewski - 2024</p>
          {Object.entries(siteConfig.social).map(([key, href]) => {
            return (
              <li key={key}>
                <a
                  href={href}
                  className={cx(
                    "w-8 h-8 grid place-items-center rounded-md",
                    "bg-gray-900 text-gray-50",
                    "dark:bg-gray-800 dark:text-gray-50"
                  )}
                  title={key}
                >
                  {SOCIAL_ICONS[key]}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </footer>
  );
};
