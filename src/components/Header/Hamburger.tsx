import { MouseEventHandler } from 'react';

type props = {
    clickHamburger: MouseEventHandler;
    navOpen: boolean;
};

const Hamburger = (props: props): JSX.Element => {
    const genericHamburgerLine = `h-[2px] w-[24px] my-[3px] rounded-full
    bg-black dark:bg-white
    transition ease transform duration-300`;

    return (
        <button
            aria-label="hamburger menu"
            type="button"
            onClick={props.clickHamburger}
            className="md:hidden flex flex-col h-[48px] w-[48px] justify-center items-center group"
        >
            <div
                className={`${genericHamburgerLine} ${
                    props.navOpen
                        ? 'rotate-45 translate-y-2 opacity-50 group-hover:opacity-100'
                        : 'opacity-50 group-hover:opacity-100'
                }`}
            />
            <div
                className={`${genericHamburgerLine} ${
                    props.navOpen
                        ? 'opacity-0'
                        : 'opacity-50 group-hover:opacity-100'
                }`}
            />
            <div
                className={`${genericHamburgerLine} ${
                    props.navOpen
                        ? '-rotate-45 -translate-y-2 opacity-50 group-hover:opacity-100'
                        : 'opacity-50 group-hover:opacity-100'
                }`}
            />
        </button>
    );
};
export default Hamburger;
