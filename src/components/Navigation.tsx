import Link from 'next/link';
import React from 'react';

const Navigation = (): JSX.Element => {
  return (
    <nav className="border-orange-200">
      <Link href="/">
        <a className="text-gray-900 dark:text-white pr-6 py-4">Home</a>
      </Link>
      <Link href="/blog">
        <a className="text-gray-900 dark:text-white pr-6 py-4">Blog</a>
      </Link>
      <Link href="/projects">
        <a className="text-gray-900 dark:text-white pr-6 py-4">Projects</a>
      </Link>
      <Link href="/resume">
        <a className="text-gray-900 dark:text-white pr-6 py-4">Resume</a>
      </Link>
    </nav>
  );
};

export default Navigation;
