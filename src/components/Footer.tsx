import React from 'react';
import GitHub from './svgs/github';
import Envelope from './svgs/envelope';
import LinkedIn from './svgs/linkedin';
import { useTheme } from 'next-themes';

const contacts = [
    {
        Comp: GitHub,
        alt: 'github icon',
        link: 'https://github.com/KonradStanski',
    },
    {
        Comp: LinkedIn,
        alt: 'linkedin icon',
        link: 'https://www.linkedin.com/in/konradstanski/',
    },
    {
        Comp: Envelope,
        alt: 'envelope icon',
        link: 'mailto:konrad.a.staniszewski@gmail.com?subject=Website',
    },
];

const Header = (): JSX.Element => {
    const { theme } = useTheme();
    return (
        <footer className="py-8">
            <div className="max-w-5xl px-8 mx-auto flex">
                <a
                    className="text-gray-900 dark:text-white pr-6"
                    href="https://github.com/KonradStanski"
                >
                    Konrad Staniszewski - Student @ University of Alberta
                </a>
                {contacts.map(({ Comp, link, alt }) => {
                    return (
                        <a
                            key={link}
                            href={link}
                            aria-label={alt}
                            className="pr-6"
                        >
                            <Comp
                                fill={theme === 'dark' ? 'white' : 'black'}
                                height={24}
                            />
                        </a>
                    );
                })}
            </div>
        </footer>
    );
};

export default Header;
