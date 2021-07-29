import React from "react";
import { GetStaticProps } from "next";
import { getAllPosts } from "@app/lib/api";
import { Layout, ProjectPostItem } from "@app/components";
import { ProjectPostType } from "@app/components/ProjectPostItem";

type props = {
    posts: ProjectPostType[];
};

export const Projects = ({ posts }: props): JSX.Element => {
    return (
        <Layout
            customMeta={{
                title: "projects",
            }}
        >
            <h1 className="text-4xl mb-16">Projects</h1>
            {posts.map((post) => (
                <ProjectPostItem key={post.slug} post={post} type="projects" />
            ))}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const posts = getAllPosts(["date", "description", "slug", "title", "demo", "source", "image", "tech"], "projects");

    return {
        props: { posts },
    };
};

export default Projects;
