import React, { useState } from 'react';
import Link from 'next/link';
import ThemeSwitch from './ThemeSwitch';
import Hamburger from './Hamburger';

const Header = (): JSX.Element => {
    const [navOpen, setNavOpen] = useState(false);

    function clickHamburger() {
        setNavOpen(!navOpen);
    }

    return (
        <header>
            <div className="max-w-5xl px-8 mx-auto">
                <div
                    id="header-container"
                    className={`flex items-start justify-between py-6`}
                >
                    <div className="flex flex-col my-auto">
                        <Hamburger
                            navOpen={navOpen}
                            clickHamburger={clickHamburger}
                        />
                        <nav
                            id="navigation"
                            className={`${
                                navOpen ? 'flex flex-col pl-3' : 'hidden'
                            } md:block`}
                        >
                            <Link href="/">
                                <a className="text-gray-900 dark:text-white pr-6 py-4">
                                    Home
                                </a>
                            </Link>
                            <Link href="/blog">
                                <a className="text-gray-900 dark:text-white pr-6 py-4">
                                    Blog
                                </a>
                            </Link>
                            <Link href="/projects">
                                <a className="text-gray-900 dark:text-white pr-6 py-4">
                                    Projects
                                </a>
                            </Link>
                            <Link href="/resume.pdf">
                                <a className="text-gray-900 dark:text-white pr-6 py-4">
                                    Resume
                                </a>
                            </Link>
                        </nav>
                    </div>
                    <ThemeSwitch />
                </div>
            </div>
        </header>
    );
};

export default Header;
