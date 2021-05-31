import React from 'react';
import Layout from '../components/Layout';
import { PostType } from '../types/post';
import { getAllPosts } from '../lib/api';
import { GetStaticProps } from 'next';
import PostItem from '../components/PostItem';

type IndexProps = {
  posts: PostType[];
};

export const Blog = ({ posts }: IndexProps): JSX.Element => {
  return (
    <Layout
      customMeta={{
        title: 'Blog',
      }}
    >
      <h1>Blog</h1>
      {posts.map((post) => (
        <PostItem key={post.slug} post={post} />
      ))}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts(['date', 'description', 'slug', 'title']);

  return {
    props: { posts },
  };
};

export default Blog;
