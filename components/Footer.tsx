import React from 'react';

const Header = (): JSX.Element => {
  return (
    <footer className="py-8">
      <div className="max-w-5xl px-8 mx-auto">
        Built by{' '}
        <a
          className="text-gray-900 dark:text-white"
          href="https://github.com/KonradStanski"
        >
          Konrad Staniszewski
        </a>
      </div>
    </footer>
  );
};

export default Header;
