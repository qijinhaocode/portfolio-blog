import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div>
      <div className="text-center pt-12 pb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          欢迎来到我的博客
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600">
          在这里，我会分享我的思考、项目和作品。
        </p>
      </div>

      <div className="space-y-10">
        {allPostsData.length > 0 ? (
          allPostsData.map(({ id, date, title, excerpt }) => (
            <article key={id} className="relative group">
              <div className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 bg-gray-100/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <p className="text-sm text-gray-500 mb-1">{date}</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  <Link href={`/posts/${id}`}>
                    <span className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6"></span>
                    {title}
                  </Link>
                </h2>
                <p className="mt-3 text-gray-600">{excerpt}</p>
                <p className="mt-4 text-sm font-medium text-blue-600">
                  阅读全文
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">暂无文章。敬请期待！</p>
          </div>
        )}
      </div>
    </div>
  );
}
