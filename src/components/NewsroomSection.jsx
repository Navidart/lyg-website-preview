import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient.js';
import Icon from './Icons.jsx';
import { cardReveal, luxuryEase, stagger } from '../motion.js';
import MotionSection from './MotionSection.jsx';

export default function NewsroomSection() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPublishedNews = async () => {
      if (!supabase) {
        if (isMounted) {
          setArticles([]);
          setError('');
          setIsLoading(false);
        }
        return;
      }

      const { data, error: newsError } = await supabase
        .from('news')
        .select('title,excerpt,category,featured_image,published_at,updated_at,slug,news_categories(name,slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(3);

      if (!isMounted) return;

      if (newsError) {
        setError('Unable to load newsroom updates.');
        setArticles([]);
      } else {
        setError('');
        setArticles(data ?? []);
      }

      setIsLoading(false);
    };

    loadPublishedNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <MotionSection className="section newsroom-section">
      <div className="news-heading">
        <div>
          <p className="eyebrow">Newsroom</p>
          <h2>Latest Insights from LYG</h2>
        </div>
        <a className="text-link icon-link" href="#">View All News <Icon name="arrowRight" size={14} /></a>
      </div>
      {isLoading ? (
        <p className="newsroom-empty">Loading latest insights...</p>
      ) : error ? (
        <p className="newsroom-empty">{error}</p>
      ) : articles.length === 0 ? (
        <p className="newsroom-empty">No published news is available yet.</p>
      ) : (
        <motion.div className="news-grid" variants={stagger}>
          {articles.map((article) => (
            <motion.article
              className="article-card"
              key={article.slug}
              variants={cardReveal}
              whileHover={{ y: -5, transition: { duration: 0.42, ease: luxuryEase } }}
            >
              <a className="article-card-link" href={`/news/${article.slug}`}>
                <div className="article-image">
                  {article.featured_image && <img src={article.featured_image} alt="" />}
                  <span>{article.news_categories?.name || article.category || 'News'}</span>
                </div>
                <div>
                  <h3>{article.title}</h3>
                  <time>{formatNewsDate(article.published_at ?? article.updated_at)}</time>
                </div>
              </a>
            </motion.article>
          ))}
        </motion.div>
      )}
    </MotionSection>
  );
}

function formatNewsDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
