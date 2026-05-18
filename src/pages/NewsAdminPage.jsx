import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import AdminActionButton from '../components/AdminActionButton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import editIconUrl from '../assets/icons/actions/ico-edit.svg?url&no-inline';
import trashIconUrl from '../assets/icons/actions/ico-trash.svg?url&no-inline';

const emptyForm = {
  title: '',
  slug: '',
  category_id: '',
  category: '',
  excerpt: '',
  content: '',
  featured_image: '',
  status: 'draft',
  published_at: '',
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  return value ? new Date(value).toISOString() : null;
}

export default function NewsAdminPage() {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);

  const sortedNews = useMemo(
    () => [...news].sort((a, b) => new Date(b.updated_at ?? b.created_at) - new Date(a.updated_at ?? a.created_at)),
    [news],
  );
  const newsStats = useMemo(() => {
    const latestUpdatedAt = sortedNews[0]?.updated_at ?? sortedNews[0]?.created_at ?? null;

    return [
      { label: 'Total News', value: news.length },
      { label: 'Published', value: news.filter((record) => record.status === 'published').length },
      { label: 'Drafts', value: news.filter((record) => record.status === 'draft').length },
      { label: 'Last Updated', value: latestUpdatedAt ? formatDate(latestUpdatedAt) : '—' },
    ];
  }, [news, sortedNews]);

  const getCategoryName = (record) => {
    const legacyCategory = record.category?.trim();

    if (record.news_categories?.name) return record.news_categories.name;
    if (legacyCategory && legacyCategory.toLowerCase() !== 'news') return legacyCategory;

    return 'Uncategorized';
  };

  const getCategoryById = (categoryId) => categories.find((category) => category.id === categoryId);

  const getCategoryByName = (name) => {
    if (!name) return undefined;
    return categories.find((category) => category.name.trim().toLowerCase() === name.trim().toLowerCase());
  };

  const getDefaultForm = () => {
    const defaultCategory = categories[0];

    return {
      ...emptyForm,
      category_id: defaultCategory?.id ?? '',
      category: defaultCategory?.name ?? '',
    };
  };

  const loadNews = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('news')
      .select('id,title,slug,category_id,category,excerpt,content,featured_image,status,published_at,created_at,updated_at,created_by,news_categories(name,slug)')
      .order('updated_at', { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setNews(data ?? []);
    }

    setIsLoading(false);
  };

  const loadCategories = async () => {
    if (!supabase) return;

    const { data, error: categoryError } = await supabase
      .from('news_categories')
      .select('id,name,slug,created_at,updated_at')
      .order('name', { ascending: true });

    if (categoryError) {
      setError(categoryError.message);
      return;
    }

    setCategories(data ?? []);
  };

  useEffect(() => {
    loadNews();
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isFormOpen || form.category_id || categories.length === 0) return;

    setForm((current) => ({
      ...current,
      category_id: categories[0].id,
      category: categories[0].name,
    }));
  }, [categories, form.category_id, isFormOpen]);

  const updateField = (field, value) => {
    setForm((current) => {
      if (field === 'title' && !isEditing && current.slug === slugify(current.title)) {
        return { ...current, title: value, slug: slugify(value) };
      }

      if (field === 'category_id') {
        const selectedCategory = categories.find((category) => category.id === value);
        return { ...current, category_id: value, category: selectedCategory?.name ?? '' };
      }

      return { ...current, [field]: value };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setMessage('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured.');
      event.target.value = '';
      return;
    }

    setIsUploadingImage(true);

    const safeFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const filePath = `news/${Date.now()}-${safeFileName}`;
    const { error: uploadError } = await supabase.storage.from('news-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploadingImage(false);
      event.target.value = '';
      return;
    }

    const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
    updateField('featured_image', data.publicUrl);
    setMessage('Featured image uploaded.');
    setIsUploadingImage(false);
    event.target.value = '';
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(getDefaultForm());
    setMessage('');
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);
    setForm({
      title: record.title ?? '',
      slug: record.slug ?? '',
      category_id: record.category_id ?? getCategoryByName(record.category)?.id ?? '',
      category: record.news_categories?.name ?? getCategoryByName(record.category)?.name ?? '',
      excerpt: record.excerpt ?? '',
      content: record.content ?? '',
      featured_image: record.featured_image ?? '',
      status: record.status ?? 'draft',
      published_at: toDatetimeLocal(record.published_at),
    });
    setMessage('');
    setError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(getDefaultForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isUploadingImage) {
      setError('Please wait for the image upload to finish.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      category_id: form.category_id || null,
      category: form.category || null,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      featured_image: form.featured_image.trim() || null,
      status: form.status,
      published_at: fromDatetimeLocal(form.published_at),
    };

    if (payload.status === 'published' && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    if (!payload.title || !payload.slug) {
      setError('Title and slug are required.');
      setIsSaving(false);
      return;
    }

    if (!payload.category_id) {
      setError('Please choose a category before saving this news article.');
      setIsSaving(false);
      return;
    }

    payload.category = getCategoryById(payload.category_id)?.name ?? null;

    const query = isEditing
      ? supabase.from('news').update(payload).eq('id', editingId).select().single()
      : supabase
          .from('news')
          .insert({ ...payload, created_by: user?.id ?? null })
          .select()
          .single();

    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setIsSaving(false);
      return;
    }

    setMessage(isEditing ? 'News article updated.' : 'News article created.');
    setIsSaving(false);
    closeForm();
    loadNews();
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(`Delete "${record.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setMessage('');
    setError('');

    const { error: deleteError } = await supabase.from('news').delete().eq('id', record.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage('News article deleted.');
    loadNews();
  };

  const handleCategoryCreate = async (event) => {
    event.preventDefault();
    const name = categoryName.trim();

    if (!name) {
      setError('Category name is required.');
      return;
    }

    setIsCategorySaving(true);
    setMessage('');
    setError('');

    const { error: categoryError } = await supabase.from('news_categories').insert({
      name,
      slug: slugify(name),
    });

    if (categoryError) {
      setError(categoryError.message);
      setIsCategorySaving(false);
      return;
    }

    setCategoryName('');
    setMessage('News category added.');
    setIsCategorySaving(false);
    loadCategories();
  };

  const startCategoryEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setMessage('');
    setError('');
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleCategoryUpdate = async (category) => {
    const name = editingCategoryName.trim();

    if (!name) {
      setError('Category name is required.');
      return;
    }

    setIsCategorySaving(true);
    setMessage('');
    setError('');

    const { error: categoryError } = await supabase
      .from('news_categories')
      .update({ name, slug: slugify(name) })
      .eq('id', category.id);

    if (categoryError) {
      setError(categoryError.message);
      setIsCategorySaving(false);
      return;
    }

    const { error: newsUpdateError } = await supabase
      .from('news')
      .update({ category: name })
      .eq('category_id', category.id);

    if (newsUpdateError) {
      setError(newsUpdateError.message);
      setIsCategorySaving(false);
      return;
    }

    setMessage('News category updated.');
    setIsCategorySaving(false);
    cancelCategoryEdit();
    loadCategories();
    loadNews();
  };

  const handleCategoryDelete = async (category) => {
    const confirmed = window.confirm(`Delete "${category.name}"? Existing news using it will fall back to News.`);
    if (!confirmed) return;

    setMessage('');
    setError('');

    const { error: newsUpdateError } = await supabase
      .from('news')
      .update({ category_id: null, category: null })
      .eq('category_id', category.id);

    if (newsUpdateError) {
      setError(newsUpdateError.message);
      return;
    }

    const { error: deleteError } = await supabase.from('news_categories').delete().eq('id', category.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage('News category deleted.');
    loadCategories();
    loadNews();
  };

  return (
    <div className="admin-news-module">
      {message && <p className="admin-alert admin-alert-success">{message}</p>}
      {error && <p className="admin-alert admin-alert-error">{error}</p>}

      <div className="admin-stats-grid admin-news-stats" aria-label="News status summary">
        {newsStats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <section className="admin-card admin-category-card" aria-label="News categories">
        <div className="admin-card-header">
          <div>
            <h3>News Categories</h3>
          </div>
        </div>
        <form className="admin-category-form" onSubmit={handleCategoryCreate}>
          <label>
            <span className="admin-category-input-row">
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Category name"
              />
              <button className="button button-primary" type="submit" disabled={isCategorySaving}>
                {isCategorySaving ? 'Adding...' : 'Add Category'}
              </button>
            </span>
          </label>
        </form>
        <div className="admin-category-list">
          {categories.length === 0 ? (
            <p className="admin-empty-state">No categories yet.</p>
          ) : (
            <div className="admin-cms-table admin-category-table" role="table" aria-label="News categories">
              <div className="admin-cms-row admin-category-row admin-cms-head" role="row">
                <span>Category</span>
                <span>Actions</span>
              </div>
              {categories.map((category) => (
                <div className="admin-cms-row admin-category-row" role="row" key={category.id}>
                  {editingCategoryId === category.id ? (
                    <>
                      <span>
                        <input
                          value={editingCategoryName}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                          aria-label={`Rename ${category.name}`}
                        />
                      </span>
                      <span className="admin-category-actions">
                        <button type="button" onClick={() => handleCategoryUpdate(category)} disabled={isCategorySaving}>
                          Save
                        </button>
                        <button type="button" onClick={cancelCategoryEdit}>
                          Cancel
                        </button>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{category.name}</span>
                      <span className="admin-category-actions">
                        <AdminActionButton type="button" onClick={() => startCategoryEdit(category)} label={`Edit ${category.name}`}>
                          <img className="admin-action-icon" src={editIconUrl} alt="" aria-hidden="true" />
                          <span className="sr-only">Edit {category.name}</span>
                        </AdminActionButton>
                        <AdminActionButton type="button" onClick={() => handleCategoryDelete(category)} label={`Delete ${category.name}`}>
                          <img className="admin-action-icon" src={trashIconUrl} alt="" aria-hidden="true" />
                          <span className="sr-only">Delete {category.name}</span>
                        </AdminActionButton>
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {isFormOpen && (
        <section className="admin-form-card" aria-label={isEditing ? 'Edit news article' : 'Create news article'}>
          <div className="admin-card-header">
            <h3>{isEditing ? 'Edit News' : 'Add News'}</h3>
            <button className="admin-text-button" type="button" onClick={closeForm}>
              Cancel
            </button>
          </div>

          <form className="admin-news-form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={form.title} onChange={(event) => updateField('title', event.target.value)} />
            </label>
            <label>
              <span>Slug</span>
              <input value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} />
            </label>
            <label>
              <span>Category</span>
              <select className="select-control" value={form.category_id} onChange={(event) => updateField('category_id', event.target.value)}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Short Summary / Excerpt</span>
              <small>Used in news cards, listings, and SEO previews.</small>
              <textarea rows="3" value={form.excerpt} onChange={(event) => updateField('excerpt', event.target.value)} />
            </label>
            <label>
              <span>Content</span>
              <textarea rows="8" value={form.content} onChange={(event) => updateField('content', event.target.value)} />
            </label>
            <label>
              <span>Featured Image</span>
              <small>Upload the main image used for news cards and article previews.</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} />
              {isUploadingImage && <em className="form-helper-text">Uploading image...</em>}
              <input
                value={form.featured_image}
                onChange={(event) => updateField('featured_image', event.target.value)}
                placeholder="Optional image URL"
              />
              {form.featured_image && (
                <img className="admin-image-preview" src={form.featured_image} alt="Featured news preview" />
              )}
            </label>
            <div className="admin-form-row">
              <label>
                <span>Status</span>
                <select className="select-control" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label>
                <span>Published At</span>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(event) => updateField('published_at', event.target.value)}
                />
              </label>
            </div>
            <button className="button button-primary admin-save-button" type="submit" disabled={isSaving || isUploadingImage}>
              {isUploadingImage ? 'Uploading...' : isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create News'}
            </button>
          </form>
        </section>
      )}

      <section className="admin-card admin-table-card">
        <div className="admin-card-header">
          <div>
            <h3>News Records</h3>
          </div>
          <button className="button button-primary admin-add-button" type="button" onClick={openCreateForm}>
            Add News
          </button>
        </div>

        {isLoading ? (
          <p className="admin-empty-state">Loading news...</p>
        ) : sortedNews.length === 0 ? (
          <p className="admin-empty-state">No news records yet. Add your first newsroom article.</p>
        ) : (
          <div className="admin-cms-table" role="table" aria-label="News records">
            <div className="admin-cms-row admin-cms-head" role="row">
              <span>Title</span>
              <span>Category</span>
              <span>Status</span>
              <span>Published At</span>
              <span>Updated At</span>
              <span>Actions</span>
            </div>
            {sortedNews.map((record) => (
              <div className="admin-cms-row" role="row" key={record.id}>
                <span>
                  <strong>{record.title}</strong>
                </span>
                <span className="admin-cms-title-cell">{getCategoryName(record)}</span>
                <span>
                  <StatusBadge status={record.status} />
                </span>
                <span>{formatDate(record.published_at ?? record.updated_at)}</span>
                <span>{formatDate(record.updated_at)}</span>
                <span className="admin-table-actions">
                  <AdminActionButton type="button" onClick={() => openEditForm(record)} label={`Edit ${record.title}`}>
                    <img className="admin-action-icon" src={editIconUrl} alt="" aria-hidden="true" />
                    <span className="sr-only">Edit {record.title}</span>
                  </AdminActionButton>
                  <AdminActionButton type="button" onClick={() => handleDelete(record)} label={`Delete ${record.title}`}>
                    <img className="admin-action-icon" src={trashIconUrl} alt="" aria-hidden="true" />
                    <span className="sr-only">Delete {record.title}</span>
                  </AdminActionButton>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
