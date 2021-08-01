import React from "react";
import { useTheme } from "next-themes";
import { LinkedinIcon, EnvelopeIcon, GithubIcon } from "@app/svgs";

const contacts = [
    {
        Icon: GithubIcon,
        alt: "github icon",
        link: "https://github.com/KonradStanski",
    },
    {
        Icon: LinkedinIcon,
        alt: "linkedin icon",
        link: "https://www.linkedin.com/in/konradstanski/",
    },
    {
        Icon: EnvelopeIcon,
        alt: "envelope icon",
        link: "mailto:konrad.a.staniszewski@gmail.com?subject=Website",
    },
];

const Header = (): JSX.Element => {
    const [mounted, setMounted] = React.useState(false);
    const { theme } = useTheme();

    // After mounting, we have access to the theme
    React.useEffect(() => setMounted(true), []);

    if (!mounted) {
        return null;
    }

    return (
        <footer className="py-8 flex">
            <div className="max-w-5xl px-8 mx-auto flex flex-col justify-center md:flex-row">
                <a className="text-gray-900 dark:text-white pr-6" href="https://github.com/KonradStanski">
                    Konrad Staniszewski - Student @ University of Alberta
                </a>
                <div className="flex justify-center pt-4 md:pt-0">
                    {contacts.map(({ Icon, link, alt }) => {
                        return (
                            <a key={link} href={link} aria-label={alt} className="pr-6">
                                <Icon theme={theme} height={24} />
                            </a>
                        );
                    })}
                </div>
            </div>
        </footer>
    );
};

export default Header;
