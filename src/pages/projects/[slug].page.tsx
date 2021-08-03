import { ProjectPostType } from "@app/components/ProjectPostItem";
import { format, parseISO } from "date-fns";
import fs from "fs";
import matter from "gray-matter";
import mdxPrism from "mdx-prism";
import { GetStaticPaths, GetStaticProps } from "next";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import React from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { WEBSITE_HOST_URL } from "@app/components/Meta";
import { MetaProps } from "@app/types/layout";
import { postFilePaths, getPostPath } from "@app/utils/mdxUtils";
import { Layout, NextImage } from "@app/components";

// Custom components/renderers to pass to MDX.
// Since the MDX files aren't loaded by webpack, they have no knowledge of how
// to handle import statements. Instead, you must include components in scope
// here.
const components = {
    Head,
    NextImage,
    Link,
};

type PostPageProps = {
    source: MDXRemoteSerializeResult;
    frontMatter: ProjectPostType;
};

const buttonStyle = `hover:shadow-md cursor-pointer mr-3 m-auto border-[3px] dark:border-gray-700 border-gray-300 
p-2 rounded-md hover:text-blue-400`;

const ProjectsPage = ({ source, frontMatter }: PostPageProps): JSX.Element => {
    const customMeta: MetaProps = {
        title: `${frontMatter.title} - Konrad Staniszewski`,
        description: frontMatter.description,
        image: `${WEBSITE_HOST_URL}${frontMatter.image}`,
        date: frontMatter.date,
        type: "article",
    };
    return (
        <Layout customMeta={customMeta}>
            <article>
                <div className="flex flex-row justify-between mb-3">
                    <h1 className="mb-3 mr-3 text-gray-900 dark:text-white">{frontMatter.title}</h1>
                    <div className="flex flex-row">
                        {frontMatter.demo && (
                            <Link href={frontMatter.demo}>
                                <div className={buttonStyle}>Demo</div>
                            </Link>
                        )}
                        {frontMatter.source && (
                            <Link href={frontMatter.source}>
                                <div className={buttonStyle}>Source</div>
                            </Link>
                        )}
                    </div>
                </div>
                <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">
                    {format(parseISO(frontMatter.date), "MMMM dd, yyyy")}
                </p>
                {frontMatter.image && (
                    <div className="mb-16 mt-10 mx-10 shadow-2xl dark:glow-gray-400-2xl">
                        <NextImage src={frontMatter.image} alt={frontMatter.title} />
                    </div>
                )}
                <div className="prose dark:prose-dark">
                    <MDXRemote {...source} components={components} />
                </div>
            </article>
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const postFilePath = path.join(getPostPath("projects"), `${params.slug}.mdx`);
    const source = fs.readFileSync(postFilePath);

    const { content, data } = matter(source);

    const mdxSource = await serialize(content, {
        // Optionally pass remark/rehype plugins
        mdxOptions: {
            remarkPlugins: [require("remark-code-titles")],
            rehypePlugins: [mdxPrism, rehypeSlug, rehypeAutolinkHeadings],
        },
        scope: data,
    });

    return {
        props: {
            source: mdxSource,
            frontMatter: data,
        },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = postFilePaths("projects")
        // Remove file extensions for page paths
        .map((path) => path.replace(/\.mdx?$/, ""))
        // Map the path into the static paths object required by Next.js
        .map((slug) => ({ params: { slug } }));

    return {
        paths,
        fallback: false,
    };
};

export default ProjectsPage;
