import React, { useState } from "react";
import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";
import Hamburger from "./Hamburger";
import { useRouter } from "next/router";

const routes = [
    {
        key: "Home",
        route: "/",
    },
    {
        key: "Blog",
        route: "/blog",
    },
    {
        key: "Projects",
        route: "/projects",
    },
    {
        key: "Resume",
        route: "/Konrad_Staniszewski_Resume.pdf",
    },
];

const Header = (): JSX.Element => {
    const [navOpen, setNavOpen] = useState(false);
    const router = useRouter();

    function clickHamburger() {
        setNavOpen(!navOpen);
    }

    return (
        <header>
            <div className="max-w-5xl px-8 mx-auto">
                <div id="header-container" className={`flex items-start justify-between py-6`}>
                    <div className="flex flex-col flex-grow my-auto">
                        <Hamburger navOpen={navOpen} clickHamburger={clickHamburger} />
                        <nav
                            id="navigation"
                            className={`${
                                navOpen ? "flex flex-col pl-16 md:pl-3 text-center" : "hidden"
                            } md:text-left md:block`}
                        >
                            {routes.map(({ key, route }) => (
                                <Link href={route} key={key}>
                                    <a
                                        className={`${
                                            router.asPath === route || (router.asPath.includes(route) && route !== "/")
                                                ? "text-blue"
                                                : "text-gray-900 dark:text-white"
                                        } text-lg border-b-2 md:border-0 border-gray-400 mr-6 my-4`}
                                    >
                                        {key}
                                    </a>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <ThemeSwitch />
                </div>
            </div>
        </header>
    );
};

export default Header;
