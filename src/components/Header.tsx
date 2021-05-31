import React from 'react';
import Navigation from './Navigation';
import ThemeSwitch from './ThemeSwitch';

const Header = (): JSX.Element => {
  return (
    <header>
      <div className="max-w-5xl px-8 mx-auto">
        <div className="flex items-center justify-between py-6">
          <Navigation />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header;
