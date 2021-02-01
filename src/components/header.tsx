import Link from "next/link";
import Head from "next/head";
import ExtLink from "./ext-link";
import { useRouter } from "next/router";
import styles from "../styles/header.module.css";

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: "Home", page: "/" },
  { label: "Blog", page: "/blog" },
  { label: "Projects", page: "/projects" }
];

export default ({ titlePre = "" }) => {
  const { pathname } = useRouter();

  return (
    <header className={styles.header}>
      <Head>
        <title>
          {titlePre ? `${titlePre} |` : ""} Konrad Staniszewski blog
        </title>
        <meta
          name="description"
          content="Konrad Staniszewski's personal portfolio and blog"
        />
        <meta name="og:title" content="Konrad's Blog" />
        <meta name="twitter:site" content="@KonStanisz" />
      </Head>
      <ul>
        {navItems.map(({ label, page, link }) => (
          <li key={label}>
            {page ? (
              <Link href={page}>
                <a className={pathname === page ? "active" : undefined}>
                  {label}
                </a>
              </Link>
            ) : (
              <ExtLink href={link}>{label}</ExtLink>
            )}
          </li>
        ))}
      </ul>
    </header>
  );
};
