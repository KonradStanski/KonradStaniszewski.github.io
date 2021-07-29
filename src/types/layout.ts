import { BlogPostType } from "@app/components/BlogPostItem";

export interface MetaProps extends Pick<BlogPostType, "date" | "description" | "image" | "title"> {
    /**
     * For the meta tag `og:type`
     */
    type?: string;
}
