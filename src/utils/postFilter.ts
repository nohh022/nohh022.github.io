import type { CollectionEntry } from "astro:content";

const postFilter = ({ data }: CollectionEntry<"blog">) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() ;
  return import.meta.env.DEV || isPublishTimePassed;
};

export default postFilter;
