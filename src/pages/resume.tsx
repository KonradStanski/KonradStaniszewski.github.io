import React from 'react';
import Layout from '../components/Layout';

export const Resume = (): JSX.Element => {
  return (
    <Layout
      customMeta={{
        title: 'About',
      }}
    >
      <h1>About Page</h1>
      <p>Welcome to the about page</p>
    </Layout>
  );
};

export default Resume;
