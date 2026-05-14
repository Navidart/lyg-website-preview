import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { supabase } from '../lib/supabaseClient.js';

function formatArticleDate(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function NewsArticlePage({ slug }) {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadArticle = async () => {
      if (!supabase) {
        if (isMounted) {
          setArticle(null);
          setError('News is not available right now.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError('');

      const { data, error: articleError } = await supabase
        .from('news')
        .select('title,slug,excerpt,content,featured_image,published_at,updated_at,category,news_categories(name,slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!isMounted) return;

      if (articleError) {
        setArticle(null);
        setError('Unable to load this article.');
      } else {
        setArticle(data);
        setError('');
      }

      setIsLoading(false);
    };

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const category = article?.news_categories?.name || article?.category || 'News';
  const articleDate = formatArticleDate(article?.published_at ?? article?.updated_at);

  return (
    <>
      <Header />
      <main className="news-article-page">
        {isLoading ? (
          <section className="news-article-shell">
            <p className="newsroom-empty">Loading article...</p>
          </section>
        ) : error ? (
          <section className="news-article-shell news-article-empty">
            <p className="eyebrow">Newsroom</p>
            <h1>Article not found</h1>
            <p>{error}</p>
          </section>
        ) : !article ? (
          <section className="news-article-shell news-article-empty">
            <p className="eyebrow">Newsroom</p>
            <h1>Article not found</h1>
            <p>This article may have been moved, unpublished, or removed.</p>
          </section>
        ) : (
          <article className="news-article-shell">
            {article.featured_image && (
              <div className="news-article-image">
                <img src={article.featured_image} alt="" />
              </div>
            )}
            <div className="news-article-content">
              <p className="eyebrow">{category}</p>
              <h1>{article.title}</h1>
              {articleDate && <time>{articleDate}</time>}
              {article.excerpt && <p className="news-article-excerpt">{article.excerpt}</p>}
              {article.content && <div className="news-article-body">{article.content}</div>}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}
