import React from 'react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

const PostItem = (props): JSX.Element => {
  return (
    <article key={props.post.slug} className="mt-12">
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        {format(parseISO(props.post.date), 'MMMM dd, yyyy')}
      </p>
      <h1 className="mb-2 text-xl">
        <Link
          as={`/${props.type}/${props.post.slug}`}
          href={`/${props.type}/[slug]`}
        >
          <a className="text-gray-900 dark:text-white dark:hover:text-blue-400">
            {props.post.title}
          </a>
        </Link>
      </h1>
      <p className="mb-3">{props.post.description}</p>
      <p>
        <Link
          as={`/${props.type}/${props.post.slug}`}
          href={`/${props.type}/[slug]`}
        >
          <a>Read More</a>
        </Link>
      </p>
    </article>
  );
};

export default PostItem;
