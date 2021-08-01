import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { MetaProps } from "@app/types/layout";

export const WEBSITE_HOST_URL = "https://konradstaniszewski.com";

const Meta = ({ customMeta }: { customMeta?: MetaProps }): JSX.Element => {
    const router = useRouter();
    const meta: MetaProps = {
        title: "Konrad Staniszewski",
        description: "Student who enjoys exploring new web technologies",
        image: `${WEBSITE_HOST_URL}/images/headshot.jpg`,
        type: "website",
        ...customMeta,
    };

    return (
        <Head>
            <title>{meta.title}</title>
            <meta content={meta.description} name="description" />
            <meta property="og:url" content={`${WEBSITE_HOST_URL}${router.asPath}`} />
            <link rel="canonical" href={`${WEBSITE_HOST_URL}${router.asPath}`} />
            <meta property="og:type" content={meta.type} />
            <meta property="og:site_name" content="Konrad Staniszewski" />
            <meta property="og:description" content={meta.description} />
            <meta property="og:title" content={meta.title} />
            <meta property="og:image" content={meta.image} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@konstanisz" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:image" content={meta.image} />
            {meta.date && <meta property="article:published_time" content={meta.date} />}
        </Head>
    );
};

export default Meta;
