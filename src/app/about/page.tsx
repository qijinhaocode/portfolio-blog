import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
};

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
        关于我
      </h1>
      <div className="prose prose-lg max-w-none text-gray-600">
        <p>
          欢迎来到我的数字花园。我是一名充满热情的开发者、创作者和终身学习者。
        </p>
        <p>
          我创建这个博客是为了记录和分享我的技术之旅、项目经验以及在此过程中学到的点点滴滴。
        </p>
        <p>
          你可以在这里找到关于 Web 开发、软件工程、以及我正在探索的一些前沿技术的文章。
        </p>
        <p>
          感谢你的来访，期待与你交流！
        </p>
      </div>
    </div>
  );
}
