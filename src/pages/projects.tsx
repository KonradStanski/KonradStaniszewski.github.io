import React from 'react';
import Layout from '../components/Layout';
import { IndexProps } from '../types/post';
import { getAllPosts } from '../lib/api';
import { GetStaticProps } from 'next';
import PostItem from '../components/PostItem';

export const Projects = ({ posts }: IndexProps): JSX.Element => {
    return (
        <Layout
            customMeta={{
                title: 'projects',
            }}
        >
            <h1>Projects</h1>
            {posts.map((post) => (
                <PostItem key={post.slug} post={post} type="projects" />
            ))}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const posts = getAllPosts(
        ['date', 'description', 'slug', 'title'],
        'projects'
    );

    return {
        props: { posts },
    };
};

export default Projects;
