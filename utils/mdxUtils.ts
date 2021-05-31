import fs from 'fs';
import path from 'path';

// POSTS_PATH is useful when you want to get the path to a specific file
export const BLOG_PATH = path.join(process.cwd(), 'data/posts');
export const PROJECTS_PATH = path.join(process.cwd(), 'data/projects');

// postFilePaths is the list of all mdx files inside the POSTS_PATH directory
export const postFilePaths = function (postType: string): string[] {
  return (
    fs
      .readdirSync(getPostPath(postType))
      // Only include md(x) files
      .filter((path) => /\.mdx?$/.test(path))
  );
};

export const getPostPath = function (postType: string): string {
  if (postType === 'blog') {
    return BLOG_PATH;
  } else {
    return PROJECTS_PATH;
  }
};
