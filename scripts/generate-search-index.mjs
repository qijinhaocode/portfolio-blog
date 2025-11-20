import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const outputFilePath = path.join(process.cwd(), 'public/search-index.json');

function getPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        content,
      };
    });
  return allPostsData;
}

function generateSearchIndex() {
  const posts = getPostsData();
  const searchIndex = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
  }));

  fs.writeFileSync(outputFilePath, JSON.stringify(searchIndex, null, 2));
  console.log(`Search index generated at ${outputFilePath}`);
}

generateSearchIndex();
