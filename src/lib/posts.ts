import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// 获取存放文章的目录
const postsDirectory = path.join(process.cwd(), 'content/posts');

// 定义文章数据的类型接口
export interface PostData {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  contentHtml?: string;
}

/**
 * 获取所有文章数据，并按日期降序排序
 */
export function getSortedPostsData(): PostData[] {
  // 读取 posts 目录下的所有文件名
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md')) // 确保只处理 markdown 文件
    .map((fileName) => {
      // 移除 ".md" 后缀，将文件名作为文章 id
      const id = fileName.replace(/\.md$/, '');

      // 读取 markdown 文件内容
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // 使用 gray-matter 解析文章的元数据
      const matterResult = matter(fileContents);

      // 组合数据和 id
      return {
        id,
        date: matterResult.data.date,
        title: matterResult.data.title,
        excerpt: matterResult.data.excerpt,
      };
    });

  // 按日期排序
  return allPostsData.sort((a, b) => {
    return a.date < b.date ? 1 : -1;
  });
}

/**
 * 获取所有文章的 ID (slug)，用于生成静态页面
 */
export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ''),
        },
      };
    });
}

/**
 * 根据 ID 获取单篇文章的完整数据，包括渲染后的 HTML 内容
 * @param id - 文章的 ID (slug)
 */
export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // 使用 gray-matter 解析元数据
  const matterResult = matter(fileContents);

  // 使用 remark 将 markdown 转换为 HTML
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // 组合数据
  return {
    id,
    contentHtml,
    date: matterResult.data.date,
    title: matterResult.data.title,
    excerpt: matterResult.data.excerpt,
  };
}
