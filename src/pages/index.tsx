import React from 'react';
import Layout from '../components/Layout';

export const Index = (): JSX.Element => {
    return (
        <Layout>
            <h1>Home Page</h1>
            <p>
                Next.js starter for your next blog or personal site. Built with:
            </p>
            <ul className="list-disc pl-4 my-6">
                <li>Next.js</li>
                <li className="mt-2">Typescript</li>
                <li className="mt-2">MDX</li>
                <li className="mt-2">Tailwind CSS</li>
            </ul>
        </Layout>
    );
};

export default Index;
