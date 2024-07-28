import { useRouter } from "next/router";
import siteConfig from "@/data/siteConfig";
import Link from "next/link";
import { ThemeSelect } from "@/components/ThemeSelect";
import { cx } from "@/lib/utils";

export const Header: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <header className="py-8 flex justify-between items-center align-middle">
      <nav>
        <ul className="flex space-x-8">
          {siteConfig.nav.map((item, index) => {
            const isActive = item.href === pathname;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cx(
                    // large text
                    "text-lg",
                    "text-gray-900 hover:text-gray-900",
                    "dark:text-gray-100 dark:hover:text-gray-300"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <ThemeSelect />
    </header>
  );
};
