import React from 'react';
import { useTheme } from 'next-themes';
import { LinkedinIcon, EnvelopeIcon, GithubIcon } from '@app/svgs';

const contacts = [
    {
        Comp: GithubIcon,
        alt: 'github icon',
        link: 'https://github.com/KonradStanski',
    },
    {
        Comp: LinkedinIcon,
        alt: 'linkedin icon',
        link: 'https://www.linkedin.com/in/konradstanski/',
    },
    {
        Comp: EnvelopeIcon,
        alt: 'envelope icon',
        link: 'mailto:konrad.a.staniszewski@gmail.com?subject=Website',
    },
];

const Header = (): JSX.Element => {
    const { theme } = useTheme();
    return (
        <footer className="py-8 flex">
            <div className="max-w-5xl px-8 mx-auto flex flex-col justify-center md:flex-row">
                <a
                    className="text-gray-900 dark:text-white pr-6"
                    href="https://github.com/KonradStanski"
                >
                    Konrad Staniszewski - Student @ University of Alberta
                </a>
                <div className="flex justify-center pt-4 md:pt-0">
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
            </div>
        </footer>
    );
};

export default Header;
