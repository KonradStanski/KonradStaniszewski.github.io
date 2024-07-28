import React from "react";

type CodepenProps = {
    title?: string;
    height?: string;
    src: string;
};

export const Codepen: React.FC<CodepenProps> = (props: CodepenProps) => {
    return (
        <iframe
            title={props.title}
            height={props.height || "280px"}
            width="100%"
            scrolling="no"
            src={`${props.src}?&default-tab=js,result`}
            loading="lazy"
            // frameborder="no"
            // allowtransparency="true"
            // allowfullscreen="true"
        ></iframe>
    );
};
