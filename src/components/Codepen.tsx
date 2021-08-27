import { useTheme } from "next-themes";
import React from "react";

type props = {
    title?: string;
    height?: string;
    src: string;
};

const Codepen = (props: props): JSX.Element => {
    const [mounted, setMounted] = React.useState(false);
    const { theme } = useTheme();
    React.useEffect(() => setMounted(true), []);
    if (!mounted) {
        return null;
    }
    return (
        <iframe
            title={props.title}
            height={props.height || "280px"}
            width="100%"
            scrolling="no"
            src={`${props.src}?&theme-id=${theme}&default-tab=js,result`}
            loading="lazy"
            // frameborder="no"
            // allowtransparency="true"
            // allowfullscreen="true"
        ></iframe>
    );
};

export default Codepen;
