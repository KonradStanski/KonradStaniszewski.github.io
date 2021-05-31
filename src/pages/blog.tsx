import React from 'react';
import Layout from '../components/Layout';
import { IndexProps } from '../types/post';
import { getAllPosts } from '../lib/api';
import { GetStaticProps } from 'next';
import PostItem from '../components/PostItem';

export const Blog = ({ posts }: IndexProps): JSX.Element => {
  return (
    <Layout
      customMeta={{
        title: 'Blog',
      }}
    >
      <h1>Blog</h1>
      {posts.map((post) => (
        <PostItem key={post.slug} post={post} type="blog" />
      ))}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts(['date', 'description', 'slug', 'title'], 'blog');

  return {
    props: { posts },
  };
};

export default Blog;
