const Hamburger = (props) => (
    <button
        aria-label="hamburger menu"
        type="button"
        style={{ height: '42px', width: '42px' }}
        onClick={props.clickHamburger}
        className="block items-center md:hidden"
    >
        <svg
            className="h-6 w-6 fill-current m-auto hover:opacity-100"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{
                opacity: '0.5',
                transition: 'opacity 0.3s ease',
            }}
        >
            {props.navOpen ? (
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
            ) : (
                <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
            )}
        </svg>
    </button>
);
export default Hamburger;
