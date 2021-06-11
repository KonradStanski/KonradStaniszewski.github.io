/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Layout from '../components/Layout';
import { useTheme } from 'next-themes';
import Image from 'next/image';

// import icons
import {
    AndroidIcon,
    JavascriptIcon,
    HtmlIcon,
    CssIcon,
    ReactIcon,
    ReduxIcon,
    PythonIcon,
    CppIcon,
    JavaIcon,
    SqliteIcon,
    GitIcon,
    LinuxIcon,
} from '../components/svgs';

const skills = [
    {
        text: 'Javascript',
        icon: JavascriptIcon,
    },
    {
        text: 'HTML',
        icon: HtmlIcon,
    },
    {
        text: 'CSS',
        icon: CssIcon,
    },
    {
        text: 'React',
        icon: ReactIcon,
    },
    {
        text: 'Redux',
        icon: ReduxIcon,
    },
    {
        text: 'Python',
        icon: PythonIcon,
    },
    {
        text: 'C++',
        icon: CppIcon,
    },
    {
        text: 'Java',
        icon: JavaIcon,
    },
    {
        text: 'Android',
        icon: AndroidIcon,
    },
    {
        text: 'SQLite',
        icon: SqliteIcon,
    },
    {
        text: 'Git',
        icon: GitIcon,
    },
    {
        text: 'Linux',
        icon: LinuxIcon,
    },
    // typescript
    // mysql
    // mongodb
    // aws
    // tailwind
    // node
    // express
];

export const Index = (): JSX.Element => {
    const { theme } = useTheme();
    return (
        <Layout>
            <div className="m-auto px-4 md:px-10">
                <h1 className="text-center text-5xl font-bold pb-10 pt-0 md:pt-10">
                    Konrad Staniszewski
                </h1>
                <div
                    id="intro-section"
                    className="py-5 flex flex-col md:flex md:flex-row"
                >
                    <div className="flex flex-col text-xl justify-around">
                        <p>
                            Hi, I'm <b>Konrad Staniszewski</b>, a fourth year
                            Computer-Software Engineering student at the
                            Univeristy of Alberta.
                        </p>
                        <p>
                            I'm interested in web development, data
                            visualization, machine learning, embedded systems,
                            networking, quantum computing, 3D printing, physics,
                            electronics, and many outdoor sports.
                        </p>
                    </div>
                    <div className="md:pl-5 pt-4 md:pt-0">
                        <Image
                            className="rounded-full md:px-3"
                            alt="Headshot"
                            src="/images/headshot.jpg"
                            height="894"
                            width="894"
                            layout="intrinsic"
                        />
                    </div>
                </div>
                {/*skills section */}
                <div
                    id="skills-section"
                    className="grid grid-cols-3 md:grid-cols-4 gap-8 justify-items-center pt-8"
                >
                    {skills.map(({ text, icon: Icon }) => (
                        <div className="flex items-center" key={text}>
                            {Icon && (
                                <Icon
                                    fill={theme === 'dark' ? 'white' : 'black'}
                                    height={20}
                                    width={20}
                                />
                            )}
                            <div className="pl-2 flex">
                                <p className="m-auto text-lg font-semibold">
                                    {text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Index;
