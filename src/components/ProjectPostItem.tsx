import React from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { NextImage } from "@app/components/";

export type ProjectPostType = {
    date?: string;
    description?: string;
    image?: string;
    slug: string;
    title: string;
    source: string;
    demo: string;
    tech: string;
};

type props = {
    post: ProjectPostType;
    type: string;
};

const buttonStyle = `hover:shadow-md cursor-pointer mr-3 border-[3px] dark:border-gray-700 border-gray-300 
p-2 rounded-md hover:text-blue-400`;

const ProjectPostItem = (props: props): JSX.Element => {
    return (
        <div key={props.post.slug} className="mb-8">
            <Link as={`/${props.type}/${props.post.slug}`} href={`/${props.type}/[slug]`}>
                <h1 className="mb-2 text-4xl cursor-pointer hover:text-gray-500">{props.post.title}</h1>
            </Link>
            <div className="h-[3px] bg-black dark:bg-white mb-3"></div>
            <h3 className="text-xl mb-1">{props.post.description}</h3>
            <p className="text-lg mb-4 text-gray-500 dark:text-gray-400">
                {`${format(parseISO(props.post.date), "MMMM dd, yyyy")} ${
                    props.post.tech ? "- " + props.post.tech : ""
                }`}
            </p>
            {props.post.image && (
                <div className="mb-16 mt-10 mx-10 shadow-2xl dark:glow-gray-400-2xl">
                    <NextImage src={props.post.image} alt={props.post.title} />
                </div>
            )}
            <div className="flex flex-row text-xl">
                {props.post.demo && (
                    <Link href={props.post.demo}>
                        <div className={buttonStyle}>Demo</div>
                    </Link>
                )}
                {props.post.source && (
                    <Link href={props.post.source}>
                        <div className={buttonStyle}>Source</div>
                    </Link>
                )}
                <Link as={`/${props.type}/${props.post.slug}`} href={`/${props.type}/[slug]`}>
                    <div className={buttonStyle}>Read More...</div>
                </Link>
            </div>
        </div>
    );
};

export default ProjectPostItem;
