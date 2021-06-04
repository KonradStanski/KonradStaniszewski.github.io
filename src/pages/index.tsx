/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Layout from '../components/Layout';
import { useTheme } from 'next-themes';

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
            <div className="flex flex-col flex-shrink m-auto px-10">
                <h1 className="text-center text-4xl font-bold py-10">
                    Konrad Staniszewski
                </h1>
                <div className="flex py-5">
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
                    <img
                        className="rounded-full"
                        src="/headshot.jpg"
                        height="85"
                        width="250"
                        alt="Headshot"
                    />
                </div>
                {/*skills section */}
                <div className="grid justify-items-center grid-flow-col grid-cols-4 grid-rows-3 gap-8 justify-center pt-8">
                    {skills.map(({ text, icon: Icon }) => (
                        <div className="flex" key={text}>
                            {Icon && (
                                <Icon
                                    fill={theme === 'dark' ? 'white' : 'black'}
                                    height={24}
                                    width={24}
                                />
                            )}
                            <p className="pl-2 text-lg font-semibold">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Index;
