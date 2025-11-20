'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/search-index.json')
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const searchResults = posts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      );
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, posts]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
        className="search-input"
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm">{post.excerpt}</p>
              
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
