import React from 'react';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('../components/PdfViewer'), {
  ssr: false,
});

export const Resume = (): JSX.Element => {
  return (
    <Layout
      customMeta={{
        title: 'Resume',
      }}
    >
      <div className="flex-grow mx-auto">
        <PdfViewer file="./resume.pdf" numPages={1} />
      </div>
    </Layout>
  );
};

export default Resume;
