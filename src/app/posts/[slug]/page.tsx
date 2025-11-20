import { getPostData, getAllPostIds } from '@/lib/posts';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    slug: string;
  };
};

// Dynamically generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const postData = await getPostData(params.slug);
    return {
      title: postData.title,
      description: postData.excerpt,
    };
  } catch (error) {
    return {
      title: "Post Not Found",
    }
  }
}

// Generate static paths for all posts at build time
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(p => ({ slug: p.params.slug }));
}

export default async function Post({ params }: Props) {
  try {
    const postData = await getPostData(params.slug);

    return (
      <article>
        <header className="mb-12 text-center">
          <p className="text-base text-gray-500 mb-2">{postData.date}</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {postData.title}
          </h1>
        </header>
        
        <div
          className="prose prose-lg lg:prose-xl max-w-none mx-auto"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml as string }}
        />
      </article>
    );
  } catch (error) {
    // If post is not found, return a 404 page
    notFound();
  }
}
