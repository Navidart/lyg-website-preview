import React, { useEffect, useMemo, useState } from 'react';
import AdminActionButton from '../components/AdminActionButton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { supabase } from '../lib/supabaseClient.js';
import editIconUrl from '../assets/icons/actions/ico-edit.svg?url&no-inline';
import trashIconUrl from '../assets/icons/actions/ico-trash.svg?url&no-inline';
import defaultAmenityIconUrl from '../assets/icons/navigation/ico-arrow-right-short.svg?url&no-inline';

const amenityIconModules = import.meta.glob('../assets/icons/amenities/*.svg', {
  eager: true,
  import: 'default',
  query: '?url&no-inline',
});

const amenityIconOptions = Object.entries(amenityIconModules)
  .map(([path, url]) => ({
    label: path.split('/').pop().replace(/\.svg$/i, ''),
    url,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const emptyAmenityForm = {
  category_id: '',
  icon: '',
  name: '',
  status: 'active',
};

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeIconValue(value) {
  return String(value ?? '').trim();
}

export default function AmenitiesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [amenityForm, setAmenityForm] = useState(emptyAmenityForm);
  const [editingAmenityId, setEditingAmenityId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortMode, setSortMode] = useState('name-asc');
  const iconInputId = 'amenity-icon-input';

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const filteredAmenities = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return amenities
      .filter((amenity) => {
        const matchesSearch = !normalizedSearch || amenity.name.toLowerCase().includes(normalizedSearch);
        const matchesCategory = categoryFilter === 'all' || amenity.category_id === categoryFilter;
        const matchesStatus = statusFilter === 'all' || amenity.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortMode === 'name-desc') return b.name.localeCompare(a.name);
        if (sortMode === 'category') {
          const categoryCompare = (a.amenity_categories?.name ?? '').localeCompare(b.amenity_categories?.name ?? '');
          return categoryCompare || a.name.localeCompare(b.name);
        }
        if (sortMode === 'status') {
          const statusCompare = String(a.status ?? '').localeCompare(String(b.status ?? ''));
          return statusCompare || a.name.localeCompare(b.name);
        }

        return a.name.localeCompare(b.name);
      });
  }, [amenities, categoryFilter, searchQuery, sortMode, statusFilter]);

  const amenityStats = useMemo(
    () => [
      { label: 'Categories', value: categories.length },
      { label: 'Amenities', value: amenities.length },
      { label: 'Active', value: amenities.filter((amenity) => amenity.status === 'active').length },
      { label: 'Inactive', value: amenities.filter((amenity) => amenity.status === 'inactive').length },
    ],
    [amenities, categories],
  );
  const selectedAmenityIcon = amenityIconOptions.find((icon) => icon.label === amenityForm.icon);

  const getAmenityIconUrl = (iconValue) => {
    const normalizedIcon = normalizeIconValue(iconValue);
    if (!normalizedIcon) return defaultAmenityIconUrl;

    const normalizedIconName = normalizedIcon.split('/').pop()?.replace(/\.svg$/i, '') ?? normalizedIcon;
    const matchingIcon = amenityIconOptions.find((icon) => icon.label === normalizedIcon || icon.label === normalizedIconName);
    return matchingIcon?.url ?? defaultAmenityIconUrl;
  };

  const loadAmenities = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('amenity_categories')
      .select('id,name,slug,display_order,status')
      .order('name', { ascending: true });

    if (categoriesError) {
      setError(categoriesError.message);
      setIsLoading(false);
      return;
    }

    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from('amenities')
      .select('id,category_id,name,icon,status,amenity_categories(name)')
      .order('name', { ascending: true });

    if (amenitiesError) {
      setError(amenitiesError.message);
      setIsLoading(false);
      return;
    }

    setCategories(categoriesData ?? []);
    setAmenities(amenitiesData ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAmenities();
  }, []);

  const resetAmenityForm = () => {
    setAmenityForm(emptyAmenityForm);
    setEditingAmenityId(null);
  };

  const handleCategoryCreate = async (event) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    const { error: createError } = await supabase.from('amenity_categories').insert({
      name,
      slug: slugify(name),
      display_order: categories.length,
      status: 'active',
    });

    if (createError) {
      setError(createError.message);
      setIsSaving(false);
      return;
    }

    setCategoryName('');
    setMessage('Amenity category added.');
    setIsSaving(false);
    loadAmenities();
  };

  const startCategoryEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleCategoryUpdate = async (category) => {
    const name = editingCategoryName.trim();
    if (!name) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    const { error: updateError } = await supabase
      .from('amenity_categories')
      .update({ name, slug: slugify(name) })
      .eq('id', category.id);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setEditingCategoryId(null);
    setEditingCategoryName('');
    setMessage('Amenity category updated.');
    setIsSaving(false);
    loadAmenities();
  };

  const handleCategoryDelete = async (category) => {
    const categoryAmenityCount = amenities.filter((amenity) => amenity.category_id === category.id).length;
    if (categoryAmenityCount > 0) {
      setError('Move or delete amenities in this category before removing it.');
      return;
    }

    const confirmed = window.confirm(`Delete "${category.name}"?`);
    if (!confirmed) return;

    const { error: deleteError } = await supabase.from('amenity_categories').delete().eq('id', category.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage('Amenity category deleted.');
    loadAmenities();
  };

  const updateAmenityForm = (field, value) => {
    setAmenityForm((current) => ({ ...current, [field]: value }));
  };

  const startAmenityEdit = (amenity) => {
    setEditingAmenityId(amenity.id);
    setAmenityForm({
      category_id: amenity.category_id ?? '',
      icon: amenity.icon ?? '',
      name: amenity.name ?? '',
      status: amenity.status ?? 'active',
    });
  };

  const handleAmenitySubmit = async (event) => {
    event.preventDefault();
    const name = amenityForm.name.trim();

    if (!name) {
      setError('Amenity name is required.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    const payload = {
      category_id: amenityForm.category_id || null,
      icon: amenityForm.icon.trim() || null,
      name,
      status: amenityForm.status,
    };

    const query = editingAmenityId
      ? supabase.from('amenities').update(payload).eq('id', editingAmenityId)
      : supabase.from('amenities').insert(payload);

    const { error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setIsSaving(false);
      return;
    }

    setMessage(editingAmenityId ? 'Amenity updated.' : 'Amenity added.');
    resetAmenityForm();
    setIsSaving(false);
    loadAmenities();
  };

  const handleAmenityDelete = async (amenity) => {
    const confirmed = window.confirm(`Delete "${amenity.name}"? It will be removed from any charter selections.`);
    if (!confirmed) return;

    const { error: deleteError } = await supabase.from('amenities').delete().eq('id', amenity.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage('Amenity deleted.');
    loadAmenities();
  };

  return (
    <div className="admin-news-module admin-amenities-module">
      {message && <p className="admin-alert admin-alert-success">{message}</p>}
      {error && <p className="admin-alert admin-alert-error">{error}</p>}

      <div className="admin-stats-grid admin-news-stats" aria-label="Amenities summary">
        {amenityStats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <section className="admin-card admin-category-card" aria-label="Amenity categories">
        <div className="admin-card-header">
          <h3 className="title-section">Manage categories</h3>
        </div>
        <form className="admin-category-form admin-news-form" onSubmit={handleCategoryCreate}>
          <label>
            <span className="admin-category-input-row">
              <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" />
              <button className="button button-primary button-size-compact" type="submit" disabled={isSaving}>
                Add category
              </button>
            </span>
          </label>
        </form>
        <div className="admin-category-list">
          {sortedCategories.length === 0 ? (
            <p className="admin-empty-state">No categories yet.</p>
          ) : (
            <div className="admin-cms-table admin-category-table" role="table" aria-label="Amenity categories">
              <div className="admin-cms-row admin-category-row admin-cms-head" role="row">
                <span>Category</span>
                <span>Actions</span>
              </div>
              {sortedCategories.map((category) => (
                <div className="admin-cms-row admin-category-row" role="row" key={category.id}>
                  {editingCategoryId === category.id ? (
                    <>
                      <span className="admin-news-form">
                        <input value={editingCategoryName} onChange={(event) => setEditingCategoryName(event.target.value)} aria-label={`Rename ${category.name}`} />
                      </span>
                      <span className="admin-form-header-actions">
                        <button
                          className="button button-tone-primary button-type-filled button-size-compact"
                          type="button"
                          onClick={() => handleCategoryUpdate(category)}
                          disabled={isSaving}
                        >
                          Save
                        </button>
                        <button
                          className="button button-tone-neutral button-type-ghost button-size-compact"
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                        >
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
                        </AdminActionButton>
                        <AdminActionButton
                          className="admin-action-button-destructive"
                          type="button"
                          onClick={() => handleCategoryDelete(category)}
                          label={`Delete ${category.name}`}
                        >
                          <img className="admin-action-icon icon-destructive" src={trashIconUrl} alt="" aria-hidden="true" />
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

      <section className="admin-form-card" aria-label={editingAmenityId ? 'Edit amenity' : 'Add amenity'}>
        <div className="admin-card-header">
          <h3 className="title-section">{editingAmenityId ? 'Edit amenity' : 'Add amenity'}</h3>
          {editingAmenityId && (
            <button className="admin-text-button" type="button" onClick={resetAmenityForm}>
              Cancel
            </button>
          )}
        </div>
        <form className="admin-news-form" onSubmit={handleAmenitySubmit}>
          <div className="admin-amenity-form-grid">
            <label>
              <span>Name</span>
              <input value={amenityForm.name} onChange={(event) => updateAmenityForm('name', event.target.value)} />
            </label>
            <label>
              <span>Category</span>
              <select className="select-control" value={amenityForm.category_id} onChange={(event) => updateAmenityForm('category_id', event.target.value)}>
                <option value="">Uncategorized</option>
                {sortedCategories.map((category) => (
                  <option value={category.id} key={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select className="select-control" value={amenityForm.status} onChange={(event) => updateAmenityForm('status', event.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="admin-amenity-icon-field">
              <span>Upload icon</span>
              <span
                className="upload-dropzone amenity-icon-picker"
                onClick={() => document.getElementById(iconInputId)?.focus()}
                role="button"
                tabIndex={0}
              >
                {selectedAmenityIcon ? (
                  <img className="svg-icon icon-brand-primary" src={selectedAmenityIcon.url} alt="" aria-hidden="true" />
                ) : (
                  <span className="amenity-icon-upload-label">Drop SVG or browse</span>
                )}
                <select
                  aria-label="Select amenity icon"
                  id={iconInputId}
                  className="amenity-icon-native-select"
                  value={amenityForm.icon}
                  onChange={(event) => updateAmenityForm('icon', event.target.value)}
                >
                  <option value="">No icon</option>
                  {amenityIconOptions.map((icon) => (
                    <option value={icon.label} key={icon.label}>{icon.label}</option>
                  ))}
                </select>
              </span>
            </label>
          </div>
          <button className="button button-primary button-size-compact admin-save-button" type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : editingAmenityId ? 'Save amenity' : 'Add amenity'}
          </button>
        </form>
      </section>

      <section className="admin-card admin-table-card">
        <div className="admin-card-header">
          <h3 className="title-section">Manage amenities</h3>
        </div>
        <div className="admin-table-filters admin-amenities-toolbar">
          <div className="admin-search-field">
            <input
              type="text"
              placeholder="Search amenities"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select className="select-control" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {sortedCategories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>
          <select className="select-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="select-control" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="category">Category</option>
            <option value="status">Status</option>
          </select>
        </div>
        {isLoading ? (
          <p className="admin-empty-state">Loading amenities...</p>
        ) : filteredAmenities.length === 0 ? (
          <p className="admin-empty-state">No amenities match the current filters.</p>
        ) : (
          <div className="admin-cms-table admin-amenities-table" role="table" aria-label="Amenities">
            <div className="admin-cms-row admin-amenities-row admin-cms-head" role="row">
              <span>Name</span>
              <span>Category</span>
              <span>Icon</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filteredAmenities.map((amenity) => (
              <div className="admin-cms-row admin-amenities-row" role="row" key={amenity.id}>
                <span className="admin-cms-title-cell">{amenity.name}</span>
                <span>{amenity.amenity_categories?.name || 'Uncategorized'}</span>
                <span className="admin-amenity-icon-cell">
                  <img className="svg-icon icon-brand-primary" src={getAmenityIconUrl(amenity.icon)} alt="" aria-hidden="true" />
                </span>
                <span><StatusBadge status={amenity.status} /></span>
                <span className="admin-table-actions">
                  <AdminActionButton type="button" onClick={() => startAmenityEdit(amenity)} label={`Edit ${amenity.name}`}>
                    <img className="admin-action-icon" src={editIconUrl} alt="" aria-hidden="true" />
                  </AdminActionButton>
                  <AdminActionButton
                    className="admin-action-button-destructive"
                    type="button"
                    onClick={() => handleAmenityDelete(amenity)}
                    label={`Delete ${amenity.name}`}
                  >
                    <img className="admin-action-icon icon-destructive" src={trashIconUrl} alt="" aria-hidden="true" />
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
