import { MouseEventHandler } from "react";

type props = {
    clickHamburger: MouseEventHandler;
    navOpen: boolean;
};

const Hamburger = (props: props): JSX.Element => {
    const genericHamburgerLine = `h-[2px] w-[24px] my-[3px] rounded-full
    bg-black dark:bg-white transform duration-300`;

    return (
        <button
            aria-label="hamburger menu"
            type="button"
            onClick={props.clickHamburger}
            className="md:hidden hover:opacity-100 transition ease duration-300 opacity-50 flex flex-col h-[42px] w-[42px] justify-center items-center"
        >
            <div className={`${genericHamburgerLine} ${props.navOpen ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`${genericHamburgerLine} ${props.navOpen ? "opacity-0" : ""}`} />
            <div className={`${genericHamburgerLine} ${props.navOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
    );
};
export default Hamburger;
