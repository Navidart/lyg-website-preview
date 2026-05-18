import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AdminActionButton from '../components/AdminActionButton.jsx';
import NumberStepper from '../components/NumberStepper.jsx';
import SearchableSelect from '../components/SearchableSelect.jsx';
import StatusBadge, { getStatusTone } from '../components/StatusBadge.jsx';
import { charterRegionOptions } from '../lib/charterRegions.js';
import { supabase } from '../lib/supabaseClient.js';
import editIconUrl from '../assets/icons/actions/ico-edit.svg?url&no-inline';
import trashIconUrl from '../assets/icons/actions/ico-trash.svg?url&no-inline';
import defaultAmenityIconUrl from '../assets/icons/navigation/ico-arrow-right-short.svg?url&no-inline';
import chevronDownIconUrl from '../assets/icons/navigation/ico-chevron-down.svg?url&no-inline';
import chevronDownLargeIconUrl from '../assets/icons/navigation/ico-chevron-down-lg.svg?url&no-inline';
import chevronUpLargeIconUrl from '../assets/icons/navigation/ico-chevron-up-lg.svg?url&no-inline';
import documentIconUrl from '../assets/icons/system/ico-document.svg?url&no-inline';

const amenityIconModules = import.meta.glob('../assets/icons/amenities/*.svg', {
  eager: true,
  import: 'default',
  query: '?url&no-inline',
});

const amenityIconOptions = Object.entries(amenityIconModules).map(([path, url]) => ({
  label: path.split('/').pop().replace(/\.svg$/i, ''),
  url,
}));

const currencyOptions = ['USD', 'EUR', 'GBP'];
const priceUnitOptions = ['per week', 'per day', 'per night', 'per charter', 'POA'];
const defaultPriceFrom = 85000;
const priceSliderMax = 1000000;
const priceSliderStep = 5000;
const defaultNumericValue = '0';
const defaultHighlightedSpecs = ['guests', 'cabins', 'crew_count', 'length'];
const charterStatusOptions = ['draft', 'published', 'unpublished'];
const defaultOptionalSectionState = {
  gallery: false,
  amenities: false,
  crew: false,
};

function createTempId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm = {
  title: '',
  slug: '',
  short_description: '',
  full_description: '',
  status: 'draft',
  featured: false,
  price_from: String(defaultPriceFrom),
  currency: 'USD',
  price_unit: 'per week',
  seasonal_pricing_notes: '',
  primary_region: '',
  available_regions: [],
  highlighted_specs: defaultHighlightedSpecs,
  embarkation_notes: '',
  cruising_area_notes: '',
  guests: defaultNumericValue,
  cabins: defaultNumericValue,
  crew_count: defaultNumericValue,
  length: defaultNumericValue,
  length_unit: 'm',
  builder: '',
  year_built: defaultNumericValue,
  year_refit: defaultNumericValue,
  beam: defaultNumericValue,
  draft: defaultNumericValue,
  designer: '',
  cruising_speed: defaultNumericValue,
  max_speed: defaultNumericValue,
  engines: '',
  flag: '',
  hull_type: '',
  gross_tonnage: defaultNumericValue,
};

const charterSpecRows = [
  { key: 'guests', label: 'Guests', field: 'guests', type: 'stepper' },
  { key: 'cabins', label: 'Cabins', field: 'cabins', type: 'stepper' },
  { key: 'crew_count', label: 'Crew', field: 'crew_count', type: 'stepper' },
  { key: 'length', label: 'Length', field: 'length', type: 'stepper', step: 0.1, context: 'meters' },
  { key: 'beam', label: 'Beam', field: 'beam', type: 'stepper', step: 0.1 },
  { key: 'draft', label: 'Draft', field: 'draft', type: 'stepper', step: 0.1 },
  { key: 'builder', label: 'Builder', field: 'builder', type: 'text' },
  { key: 'designer', label: 'Designer', field: 'designer', type: 'text' },
  { key: 'year_built', label: 'Year built', field: 'year_built', type: 'stepper' },
  { key: 'year_refit', label: 'Year refit', field: 'year_refit', type: 'stepper' },
  { key: 'cruising_speed', label: 'Cruising speed', field: 'cruising_speed', type: 'stepper', step: 0.1 },
  { key: 'max_speed', label: 'Max speed', field: 'max_speed', type: 'stepper', step: 0.1 },
  { key: 'engines', label: 'Engines', field: 'engines', type: 'textarea' },
  { key: 'flag', label: 'Flag', field: 'flag', type: 'text' },
  { key: 'hull_type', label: 'Hull type', field: 'hull_type', type: 'text' },
  { key: 'gross_tonnage', label: 'Gross tonnage', field: 'gross_tonnage', type: 'stepper', step: 0.1 },
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatPrice(value, currency = 'USD', unit = 'per week') {
  if (value === null || value === undefined || value === '') return '-';

  const formatted = new Intl.NumberFormat('en', {
    currency: currency || 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value));
  const normalizedUnit = String(unit || 'per week').replace(/^per\s+/i, '');

  return `${formatted} / ${normalizedUnit}`;
}

function formatCurrencyValue(value, currency = 'USD') {
  if (value === null || value === undefined || value === '') return '';

  return new Intl.NumberFormat('en', {
    currency: currency || 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value));
}

function toOptionalText(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toOptionalInteger(value) {
  if (value === '' || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : null;
}

function formatLengthConversion(value) {
  const meters = Number(value);
  if (!Number.isFinite(meters) || meters <= 0) return '';

  const feet = meters * 3.28084;
  const formattedMeters = new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
  }).format(meters);

  return `${formattedMeters} m • ${feet.toFixed(1)} ft`;
}

function regionsToInput(regions) {
  return Array.isArray(regions) ? regions : [];
}

function inputToRegions(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : null;
  }

  const regions = String(value ?? '')
    .split(',')
    .map((region) => region.trim())
    .filter(Boolean);

  return regions.length > 0 ? regions : null;
}

function getAmenityIconUrl(iconValue) {
  const normalizedIcon = String(iconValue ?? '').trim();
  if (!normalizedIcon) return defaultAmenityIconUrl;

  const normalizedIconName = normalizedIcon.split('/').pop()?.replace(/\.svg$/i, '') ?? normalizedIcon;
  const matchingIcon = amenityIconOptions.find((icon) => icon.label === normalizedIcon || icon.label === normalizedIconName);
  return matchingIcon?.url ?? defaultAmenityIconUrl;
}

function getCrewInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'CP';

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function hasCrewProfileContent(profile) {
  return Boolean(
    String(profile.crew_name ?? '').trim()
    || String(profile.role ?? '').trim()
    || String(profile.bio ?? '').trim()
    || String(profile.avatar_image ?? '').trim(),
  );
}

function formatStatusLabel(value, fallback = 'Status') {
  const label = String(value ?? '').trim();
  if (!label) return fallback;

  return label
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ChartersAdminPage() {
  const registryInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [charters, setCharters] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [crewProfiles, setCrewProfiles] = useState([]);
  const [amenityCategories, setAmenityCategories] = useState([]);
  const [amenityLibrary, setAmenityLibrary] = useState([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isManualFormVisible, setIsManualFormVisible] = useState(false);
  const [isRegistryDragging, setIsRegistryDragging] = useState(false);
  const [isGalleryDragging, setIsGalleryDragging] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadingCrewProfileId, setUploadingCrewProfileId] = useState(null);
  const [galleryUrlRows, setGalleryUrlRows] = useState([]);
  const [galleryDraftId, setGalleryDraftId] = useState(() => createTempId('draft'));
  const [draggingGalleryImageId, setDraggingGalleryImageId] = useState(null);
  const [draggingCrewProfileId, setDraggingCrewProfileId] = useState(null);
  const [optionalSectionsOpen, setOptionalSectionsOpen] = useState(defaultOptionalSectionState);
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);
  const [statusMenuPosition, setStatusMenuPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);
  const priceNumber = Number(form.price_from) || 0;
  const priceSliderUpperLimit = Math.max(priceSliderMax, Math.ceil((priceNumber * 1.15) / priceSliderStep) * priceSliderStep);
  const priceSliderValue = Math.min(Math.max(priceNumber, 0), priceSliderUpperLimit);
  const priceLabelContext = `${form.currency || 'USD'} · ${form.price_unit || 'per week'}`;
  const formattedPricePreview = priceNumber > 0 ? formatCurrencyValue(priceNumber, form.currency) : '';

  const sortedCharters = useMemo(
    () => [...charters].sort((a, b) => new Date(b.updated_at ?? b.created_at) - new Date(a.updated_at ?? a.created_at)),
    [charters],
  );

  const charterStats = useMemo(
    () => [
      { label: 'Total Charters', value: charters.length },
      { label: 'Published', value: charters.filter((charter) => charter.status === 'published').length },
      { label: 'Drafts', value: charters.filter((charter) => charter.status === 'draft').length },
      { label: 'Featured', value: charters.filter((charter) => charter.featured).length },
    ],
    [charters],
  );

  const amenityLibraryByCategory = useMemo(() => {
    const categoryMap = new Map(amenityCategories.map((category) => [category.id, []]));

    amenityLibrary.forEach((amenity) => {
      const categoryId = amenity.category_id ?? 'uncategorized';
      if (!categoryMap.has(categoryId)) categoryMap.set(categoryId, []);
      categoryMap.get(categoryId).push(amenity);
    });

    categoryMap.forEach((categoryAmenities) => {
      categoryAmenities.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
    });

    return categoryMap;
  }, [amenityCategories, amenityLibrary]);

  const optionalSectionSummaries = useMemo(() => ({
    gallery: `${galleryImages.length} image${galleryImages.length === 1 ? '' : 's'}`,
    amenities: `${selectedAmenityIds.length} selected`,
    crew: `${crewProfiles.length} added`,
  }), [crewProfiles.length, galleryImages.length, selectedAmenityIds.length]);

  const toggleOptionalSection = (sectionKey) => {
    setOptionalSectionsOpen((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

  const loadCharters = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('charters')
      .select(
        [
          'id',
          'title',
          'slug',
          'short_description',
          'full_description',
          'status',
          'featured',
          'price_from',
          'currency',
          'price_unit',
          'seasonal_pricing_notes',
          'primary_region',
          'available_regions',
          'highlighted_specs',
          'embarkation_notes',
          'cruising_area_notes',
          'guests',
          'cabins',
          'crew_count',
          'length',
          'length_unit',
          'builder',
          'year_built',
          'year_refit',
          'beam',
          'draft',
          'designer',
          'cruising_speed',
          'max_speed',
          'engines',
          'flag',
          'hull_type',
          'gross_tonnage',
          'created_at',
          'updated_at',
        ].join(','),
      )
      .order('updated_at', { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setCharters(data ?? []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadCharters();
    loadAmenityLibrary();
  }, []);

  useEffect(() => {
    if (!openStatusMenuId) return undefined;

    const handlePointerDown = (event) => {
      if (!event.target.closest?.('.admin-status-menu-wrap, .admin-status-menu')) {
        setOpenStatusMenuId(null);
        setStatusMenuPosition(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenStatusMenuId(null);
        setStatusMenuPosition(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openStatusMenuId]);

  const loadGalleryImages = async (charterId) => {
    if (!supabase || !charterId) {
      setGalleryImages([]);
      return;
    }

    const { data, error: galleryError } = await supabase
      .from('charter_gallery_images')
      .select('id,image_url,alt_text,caption,display_order,is_featured')
      .eq('charter_id', charterId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (galleryError) {
      setError(galleryError.message);
      setGalleryImages([]);
      return;
    }

    setGalleryImages(data ?? []);
  };

  const loadCrewProfiles = async (charterId) => {
    if (!supabase || !charterId) {
      setCrewProfiles([]);
      return;
    }

    const { data, error: crewError } = await supabase
      .from('charter_crew_profiles')
      .select('id,avatar_image,crew_name,role,bio,display_order')
      .eq('charter_id', charterId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (crewError) {
      setError(crewError.message);
      setCrewProfiles([]);
      return;
    }

    setCrewProfiles(data ?? []);
  };

  const loadAmenityLibrary = async () => {
    if (!supabase) {
      setAmenityCategories([]);
      setAmenityLibrary([]);
      return;
    }

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('amenity_categories')
      .select('id,name,slug,display_order,status')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (categoriesError) {
      setError(categoriesError.message);
      setAmenityCategories([]);
      return;
    }

    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from('amenities')
      .select('id,category_id,name,icon,status')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (amenitiesError) {
      setError(amenitiesError.message);
      setAmenityLibrary([]);
      return;
    }

    setAmenityCategories(categoriesData ?? []);
    setAmenityLibrary(amenitiesData ?? []);
  };

  const loadCharterAmenitySelections = async (charterId) => {
    if (!supabase || !charterId) {
      setSelectedAmenityIds([]);
      return;
    }

    const { data, error: selectionsError } = await supabase
      .from('charter_amenities')
      .select('amenity_id')
      .eq('charter_id', charterId)
      .not('amenity_id', 'is', null);

    if (selectionsError) {
      setError(selectionsError.message);
      setSelectedAmenityIds([]);
      return;
    }

    setSelectedAmenityIds((data ?? []).map((row) => row.amenity_id).filter(Boolean));
  };

  const updateField = (field, value) => {
    setForm((current) => {
      if (field === 'title' && !isEditing && current.slug === slugify(current.title)) {
        return { ...current, title: value, slug: slugify(value) };
      }

      return { ...current, [field]: value };
    });
  };

  const toggleHighlightedSpec = (specKey) => {
    setForm((current) => {
      const highlightedSpecs = Array.isArray(current.highlighted_specs) ? current.highlighted_specs : [];
      const isHighlighted = highlightedSpecs.includes(specKey);

      return {
        ...current,
        highlighted_specs: isHighlighted
          ? highlightedSpecs.filter((highlightedSpec) => highlightedSpec !== specKey)
          : [...highlightedSpecs, specKey],
      };
    });
  };

  const toggleSelectedAmenity = (amenityId) => {
    setSelectedAmenityIds((current) => (
      current.includes(amenityId)
        ? current.filter((selectedAmenityId) => selectedAmenityId !== amenityId)
        : [...current, amenityId]
    ));
  };

  const renderSpecInput = (spec) => {
    if (spec.type === 'stepper') {
      return (
        <NumberStepper
          label={spec.label}
          onChange={(value) => updateField(spec.field, value)}
          step={spec.step ?? 1}
          value={form[spec.field]}
        />
      );
    }

    if (spec.type === 'textarea') {
      return <textarea rows="2" value={form[spec.field]} onChange={(event) => updateField(spec.field, event.target.value)} />;
    }

    return <input value={form[spec.field]} onChange={(event) => updateField(spec.field, event.target.value)} />;
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage('');
    setError('');
    setGalleryImages([]);
    setCrewProfiles([]);
    setSelectedAmenityIds([]);
    setGalleryUrlRows([]);
    setGalleryDraftId(createTempId('draft'));
    setOptionalSectionsOpen(defaultOptionalSectionState);
    setIsManualFormVisible(false);
    setIsFormOpen(true);
  };

  const openEditForm = (charter) => {
    setEditingId(charter.id);
    setForm({
      title: charter.title ?? '',
      slug: charter.slug ?? '',
      short_description: charter.short_description ?? '',
      full_description: charter.full_description ?? '',
      status: charter.status ?? 'draft',
      featured: Boolean(charter.featured),
      price_from: charter.price_from ?? String(defaultPriceFrom),
      currency: charter.currency ?? 'USD',
      price_unit: charter.price_unit ?? 'per week',
      seasonal_pricing_notes: charter.seasonal_pricing_notes ?? '',
      primary_region: charter.primary_region ?? '',
      available_regions: regionsToInput(charter.available_regions),
      highlighted_specs: Array.isArray(charter.highlighted_specs) ? charter.highlighted_specs : defaultHighlightedSpecs,
      embarkation_notes: charter.embarkation_notes ?? '',
      cruising_area_notes: charter.cruising_area_notes ?? '',
      guests: charter.guests ?? defaultNumericValue,
      cabins: charter.cabins ?? defaultNumericValue,
      crew_count: charter.crew_count ?? defaultNumericValue,
      length: charter.length ?? defaultNumericValue,
      length_unit: charter.length_unit ?? 'm',
      builder: charter.builder ?? '',
      year_built: charter.year_built ?? defaultNumericValue,
      year_refit: charter.year_refit ?? defaultNumericValue,
      beam: charter.beam ?? defaultNumericValue,
      draft: charter.draft ?? defaultNumericValue,
      designer: charter.designer ?? '',
      cruising_speed: charter.cruising_speed ?? defaultNumericValue,
      max_speed: charter.max_speed ?? defaultNumericValue,
      engines: charter.engines ?? '',
      flag: charter.flag ?? '',
      hull_type: charter.hull_type ?? '',
      gross_tonnage: charter.gross_tonnage ?? defaultNumericValue,
    });
    setMessage('');
    setError('');
    setGalleryUrlRows([]);
    setGalleryDraftId(charter.id);
    loadGalleryImages(charter.id);
    loadCrewProfiles(charter.id);
    loadCharterAmenitySelections(charter.id);
    setOptionalSectionsOpen(defaultOptionalSectionState);
    setIsManualFormVisible(false);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setGalleryImages([]);
    setCrewProfiles([]);
    setSelectedAmenityIds([]);
    setGalleryUrlRows([]);
    setGalleryDraftId(createTempId('draft'));
    setOptionalSectionsOpen(defaultOptionalSectionState);
  };

  const getPayload = () => ({
    title: form.title.trim(),
    slug: form.slug.trim() || slugify(form.title),
    short_description: toOptionalText(form.short_description),
    full_description: toOptionalText(form.full_description),
    status: form.status,
    featured: Boolean(form.featured),
    price_from: toOptionalNumber(form.price_from),
    currency: form.currency.trim() || 'USD',
    price_unit: form.price_unit.trim() || 'per week',
    seasonal_pricing_notes: toOptionalText(form.seasonal_pricing_notes),
    primary_region: toOptionalText(form.primary_region),
    available_regions: inputToRegions(form.available_regions),
    highlighted_specs: form.highlighted_specs,
    embarkation_notes: toOptionalText(form.embarkation_notes),
    cruising_area_notes: toOptionalText(form.cruising_area_notes),
    guests: toOptionalInteger(form.guests),
    cabins: toOptionalInteger(form.cabins),
    crew_count: toOptionalInteger(form.crew_count),
    length: toOptionalNumber(form.length),
    length_unit: form.length_unit.trim() || 'm',
    builder: toOptionalText(form.builder),
    year_built: toOptionalInteger(form.year_built),
    year_refit: toOptionalInteger(form.year_refit),
    beam: toOptionalNumber(form.beam),
    draft: toOptionalNumber(form.draft),
    designer: toOptionalText(form.designer),
    cruising_speed: toOptionalNumber(form.cruising_speed),
    max_speed: toOptionalNumber(form.max_speed),
    engines: toOptionalText(form.engines),
    flag: toOptionalText(form.flag),
    hull_type: toOptionalText(form.hull_type),
    gross_tonnage: toOptionalNumber(form.gross_tonnage),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = getPayload();

    if (!payload.title || !payload.slug) {
      setError('Title and slug are required.');
      return;
    }

    const populatedCrewProfiles = crewProfiles
      .filter(hasCrewProfileContent)
      .map((profile, index) => ({ ...profile, display_order: index }));

    const incompleteCrewProfile = populatedCrewProfiles.find((profile) => !String(profile.crew_name ?? '').trim());
    if (incompleteCrewProfile) {
      setError('Crew name is required for each crew profile.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    setError('');

    const query = isEditing
      ? supabase.from('charters').update(payload).eq('id', editingId).select().single()
      : supabase.from('charters').insert(payload).select().single();

    const { data: savedCharter, error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setIsSaving(false);
      return;
    }

    const charterId = savedCharter?.id ?? editingId;
    const savedGalleryImages = galleryImages.filter((image) => !image.isLocal);

    for (const image of savedGalleryImages) {
      const { error: orderSaveError } = await supabase
        .from('charter_gallery_images')
        .update({ display_order: Number(image.display_order) || 0 })
        .eq('id', image.id);

      if (orderSaveError) {
        setEditingId(charterId);
        setError(`Charter saved, but gallery order could not be saved: ${orderSaveError.message}`);
        setIsSaving(false);
        loadCharters();
        return;
      }
    }

    const pendingGalleryImages = galleryImages.filter((image) => image.isLocal && !image.isLocalFile);

    if (pendingGalleryImages.length > 0) {
      if (pendingGalleryImages.some((image) => image.is_featured)) {
        const { error: resetFeaturedError } = await supabase
          .from('charter_gallery_images')
          .update({ is_featured: false })
          .eq('charter_id', charterId);

        if (resetFeaturedError) {
          setEditingId(charterId);
          setError(`Charter saved, but gallery featured state could not be updated: ${resetFeaturedError.message}`);
          setIsSaving(false);
          loadCharters();
          return;
        }
      }

      const { error: gallerySaveError } = await supabase.from('charter_gallery_images').insert(
        pendingGalleryImages.map((image, index) => ({
          charter_id: charterId,
          image_url: image.image_url,
          caption: toOptionalText(image.caption),
          alt_text: toOptionalText(image.alt_text),
          display_order: Number.isFinite(Number(image.display_order)) ? Number(image.display_order) : index,
          is_featured: Boolean(image.is_featured),
        })),
      );

      if (gallerySaveError) {
        setEditingId(charterId);
        setError(`Charter saved, but gallery images could not be saved: ${gallerySaveError.message}`);
        setIsSaving(false);
        loadCharters();
        return;
      }
    }

    const { error: deleteAmenitySelectionsError } = await supabase
      .from('charter_amenities')
      .delete()
      .eq('charter_id', charterId)
      .not('amenity_id', 'is', null);

    if (deleteAmenitySelectionsError) {
      setEditingId(charterId);
      setError(`Charter saved, but amenities could not be updated: ${deleteAmenitySelectionsError.message}`);
      setIsSaving(false);
      loadCharters();
      return;
    }

    if (selectedAmenityIds.length > 0) {
      const { error: amenitiesSaveError } = await supabase.from('charter_amenities').insert(
        selectedAmenityIds.map((amenityId, index) => ({
          charter_id: charterId,
          amenity_id: amenityId,
          display_order: index,
        })),
      );

      if (amenitiesSaveError) {
        setEditingId(charterId);
        setError(`Charter saved, but amenities could not be saved: ${amenitiesSaveError.message}`);
        setIsSaving(false);
        loadCharters();
        return;
      }
    }

    const { error: deleteCrewProfilesError } = await supabase
      .from('charter_crew_profiles')
      .delete()
      .eq('charter_id', charterId);

    if (deleteCrewProfilesError) {
      setEditingId(charterId);
      setError(`Charter saved, but crew profiles could not be updated: ${deleteCrewProfilesError.message}`);
      setIsSaving(false);
      loadCharters();
      return;
    }

    if (populatedCrewProfiles.length > 0) {
      const { error: crewSaveError } = await supabase.from('charter_crew_profiles').insert(
        populatedCrewProfiles.map((profile, index) => ({
          charter_id: charterId,
          avatar_image: toOptionalText(profile.avatar_image),
          crew_name: String(profile.crew_name ?? '').trim(),
          role: toOptionalText(profile.role),
          bio: toOptionalText(profile.bio),
          display_order: index,
        })),
      );

      if (crewSaveError) {
        setEditingId(charterId);
        setError(`Charter saved, but crew profiles could not be saved: ${crewSaveError.message}`);
        setIsSaving(false);
        loadCharters();
        return;
      }
    }

    setMessage(isEditing ? 'Charter updated.' : 'Charter created.');
    setIsSaving(false);
    closeForm();
    loadCharters();
  };

  const handleDelete = async (charter) => {
    const confirmed = window.confirm(`Delete "${charter.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setMessage('');
    setError('');

    const { error: deleteError } = await supabase.from('charters').delete().eq('id', charter.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage('Charter deleted.');
    loadCharters();
  };

  const handleTableStatusChange = async (charterId, nextStatus) => {
    const previousCharters = charters;

    setMessage('');
    setError('');
    setOpenStatusMenuId(null);
    setStatusMenuPosition(null);
    setCharters((current) => current.map((charter) => (
      charter.id === charterId ? { ...charter, status: nextStatus } : charter
    )));

    const { data, error: statusUpdateError } = await supabase
      .from('charters')
      .update({ status: nextStatus })
      .eq('id', charterId)
      .select()
      .single();

    if (statusUpdateError) {
      setCharters(previousCharters);
      setError(statusUpdateError.message);
      return;
    }

    setCharters((current) => current.map((charter) => (
      charter.id === charterId ? { ...charter, ...data } : charter
    )));
    setMessage('Charter status updated.');
  };

  const toggleTableStatusMenu = (charterId, event) => {
    if (openStatusMenuId === charterId) {
      setOpenStatusMenuId(null);
      setStatusMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setOpenStatusMenuId(charterId);
    setStatusMenuPosition({
      left: rect.left,
      top: rect.bottom + 6,
      minWidth: rect.width,
    });
  };

  const handleRegistryUploadPlaceholder = (event) => {
    const [file] = event.target.files ?? [];
    if (!file) return;

    setMessage('Registry upload received. AI pre-fill is not available yet; use the form below to review and enter details manually.');
    setIsManualFormVisible(true);
    event.target.value = '';
  };

  const handleRegistryFile = (file) => {
    if (!file) return;

    setMessage('Registry upload received. AI pre-fill is not available yet; use the form below to review and enter details manually.');
    setIsManualFormVisible(true);
  };

  const handleRegistryDrop = (event) => {
    event.preventDefault();
    setIsRegistryDragging(false);
    handleRegistryFile(event.dataTransfer.files?.[0]);
  };

  const handleGalleryFiles = async (files) => {
    if (!files?.length) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const imageFiles = Array.from(files);
    const unsupportedFile = imageFiles.find((file) => !allowedTypes.includes(file.type));

    if (unsupportedFile) {
      setError('Please upload JPG, PNG, or WebP gallery images.');
      return;
    }

    if (!supabase) {
      setError('Gallery image upload is not available right now.');
      return;
    }

    setIsUploadingGallery(true);
    setError('');
    setMessage('');

    const folderId = editingId || galleryDraftId;
    const uploadedImages = [];

    for (const file of imageFiles) {
      const safeFileName = sanitizeFileName(file.name) || 'gallery-image';
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeFileName}`;
      const filePath = `charters/${folderId}/${uniqueFileName}`;
      const { error: uploadError } = await supabase.storage.from('charter-gallery').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        setError(uploadError.message);
        setIsUploadingGallery(false);
        return;
      }

      const { data } = supabase.storage.from('charter-gallery').getPublicUrl(filePath);
      uploadedImages.push({
        id: createTempId('gallery-image'),
        image_url: data.publicUrl,
        caption: null,
        alt_text: null,
        display_order: galleryImages.length + uploadedImages.length,
        is_featured: galleryImages.length === 0 && uploadedImages.length === 0,
        isLocal: true,
        storage_path: filePath,
      });
    }

    setGalleryImages((current) => [...current, ...uploadedImages]);
    setMessage(`${uploadedImages.length} gallery image${uploadedImages.length === 1 ? '' : 's'} uploaded. Save the charter to persist gallery details.`);
    setIsUploadingGallery(false);
  };

  const handleGalleryInputChange = async (event) => {
    await handleGalleryFiles(event.target.files);
    event.target.value = '';
  };

  const handleGalleryDrop = async (event) => {
    event.preventDefault();
    setIsGalleryDragging(false);
    await handleGalleryFiles(event.dataTransfer.files);
  };

  const handleAddGalleryUrlRow = () => {
    setGalleryUrlRows((current) => [...current, { id: createTempId('gallery-url'), value: '' }]);
  };

  const updateGalleryUrlRow = (rowId, value) => {
    setGalleryUrlRows((current) => current.map((row) => (row.id === rowId ? { ...row, value } : row)));
  };

  const handleAddGalleryImageUrl = (rowId) => {
    const urlRow = galleryUrlRows.find((row) => row.id === rowId);
    const imageUrl = urlRow?.value.trim();
    if (!imageUrl) return;

    setGalleryImages((current) => [
      ...current,
      {
        id: createTempId('gallery-image'),
        image_url: imageUrl,
        caption: null,
        alt_text: null,
        display_order: current.length,
        is_featured: current.length === 0,
        isLocal: true,
      },
    ]);
    setGalleryUrlRows((current) => current.filter((row) => row.id !== rowId));
    setMessage('Gallery image queued. Save the charter to persist it.');
  };

  const updateGalleryImage = async (imageId, patch) => {
    if (String(imageId).startsWith('gallery-image-')) {
      setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, ...patch } : image)));
      return;
    }

    const { error: updateError } = await supabase
      .from('charter_gallery_images')
      .update(patch)
      .eq('id', imageId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, ...patch } : image)));
  };

  const moveGalleryImage = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setGalleryImages((current) => {
      const sourceIndex = current.findIndex((image) => image.id === sourceId);
      const targetIndex = current.findIndex((image) => image.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return current;

      const nextImages = [...current];
      const [movedImage] = nextImages.splice(sourceIndex, 1);
      nextImages.splice(targetIndex, 0, movedImage);

      return nextImages.map((image, index) => ({ ...image, display_order: index }));
    });
  };

  const handleGalleryFeaturedChange = async (imageId) => {
    const targetImage = galleryImages.find((image) => image.id === imageId);
    if (targetImage?.isLocal || !editingId) {
      setGalleryImages((current) => current.map((image) => ({ ...image, is_featured: image.id === imageId })));
      return;
    }

    const { error: resetError } = await supabase
      .from('charter_gallery_images')
      .update({ is_featured: false })
      .eq('charter_id', editingId);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    const { error: featureError } = await supabase
      .from('charter_gallery_images')
      .update({ is_featured: true })
      .eq('id', imageId);

    if (featureError) {
      setError(featureError.message);
      return;
    }

    setGalleryImages((current) => current.map((image) => ({ ...image, is_featured: image.id === imageId })));
  };

  const handleGalleryDelete = async (imageId) => {
    const targetImage = galleryImages.find((image) => image.id === imageId);

    if (targetImage?.isLocal) {
      if (targetImage.storage_path) {
        const { error: storageDeleteError } = await supabase.storage.from('charter-gallery').remove([targetImage.storage_path]);
        if (storageDeleteError) {
          setError(storageDeleteError.message);
          return;
        }
      }

      setGalleryImages((current) => current.filter((image) => image.id !== imageId));
      return;
    }

    const { error: deleteGalleryError } = await supabase
      .from('charter_gallery_images')
      .delete()
      .eq('id', imageId);

    if (deleteGalleryError) {
      setError(deleteGalleryError.message);
      return;
    }

    setGalleryImages((current) => current.filter((image) => image.id !== imageId));
  };

  const addCrewProfile = () => {
    setCrewProfiles((current) => [
      ...current,
      {
        id: createTempId('crew-profile'),
        avatar_image: '',
        crew_name: '',
        role: '',
        bio: '',
        display_order: current.length,
        isLocal: true,
      },
    ]);
  };

  const updateCrewProfile = (profileId, patch) => {
    setCrewProfiles((current) => current.map((profile) => (profile.id === profileId ? { ...profile, ...patch } : profile)));
  };

  const removeCrewProfile = async (profileId) => {
    const targetProfile = crewProfiles.find((profile) => profile.id === profileId);

    if (targetProfile?.isLocal && targetProfile.storage_path && supabase) {
      const { error: storageDeleteError } = await supabase.storage.from('charter-gallery').remove([targetProfile.storage_path]);
      if (storageDeleteError) {
        setError(storageDeleteError.message);
        return;
      }
    }

    setCrewProfiles((current) => (
      current
        .filter((profile) => profile.id !== profileId)
        .map((profile, index) => ({ ...profile, display_order: index }))
    ));
  };

  const moveCrewProfile = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setCrewProfiles((current) => {
      const sourceIndex = current.findIndex((profile) => profile.id === sourceId);
      const targetIndex = current.findIndex((profile) => profile.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return current;

      const nextProfiles = [...current];
      const [movedProfile] = nextProfiles.splice(sourceIndex, 1);
      nextProfiles.splice(targetIndex, 0, movedProfile);

      return nextProfiles.map((profile, index) => ({ ...profile, display_order: index }));
    });
  };

  const handleCrewAvatarFile = async (profileId, file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP crew avatar.');
      return;
    }

    if (!supabase) {
      setError('Crew avatar upload is not available right now. Use an image URL instead.');
      return;
    }

    setUploadingCrewProfileId(profileId);
    setError('');
    setMessage('');

    const folderId = editingId || galleryDraftId;
    const safeFileName = sanitizeFileName(file.name) || 'crew-avatar';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeFileName}`;
    const filePath = `charters/${folderId}/crew/${uniqueFileName}`;
    const { error: uploadError } = await supabase.storage.from('charter-gallery').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      setError(uploadError.message);
      setUploadingCrewProfileId(null);
      return;
    }

    const { data } = supabase.storage.from('charter-gallery').getPublicUrl(filePath);
    updateCrewProfile(profileId, {
      avatar_image: data.publicUrl,
      isLocal: true,
      storage_path: filePath,
    });
    setMessage('Crew avatar uploaded. Save the charter to persist crew profile details.');
    setUploadingCrewProfileId(null);
  };

  const handleCrewAvatarInputChange = async (profileId, event) => {
    const [file] = event.target.files ?? [];
    await handleCrewAvatarFile(profileId, file);
    event.target.value = '';
  };

  return (
    <div className="admin-news-module admin-charters-module">
      {message && <p className="admin-alert admin-alert-success">{message}</p>}
      {error && <p className="admin-alert admin-alert-error">{error}</p>}

      <div className="admin-stats-grid admin-news-stats" aria-label="Charters status summary">
        {charterStats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      {isFormOpen && (
        <section className="admin-form-card" aria-label={isEditing ? 'Edit charter' : 'Create charter'}>
          <div className="admin-card-header admin-charter-form-header">
            <h3 className="title-section">{isEditing ? 'Edit charter' : 'Add charter'}</h3>
            <div className="admin-form-header-actions">
              <label className="admin-form-status-control">
                <span>Status</span>
                <select className="select-control" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </label>
              <button className="admin-text-button" type="button" onClick={closeForm}>
                Cancel
              </button>
              <button className="button button-primary button-size-compact" form="charter-admin-form" type="submit" disabled={isSaving}>
                Save
              </button>
            </div>
          </div>

          <form className="admin-news-form admin-charter-form admin-charter-form-reveal" id="charter-admin-form" onSubmit={handleSubmit}>
            <aside className={`charter-registry-panel ${isManualFormVisible ? 'is-compact' : ''}`} aria-label="Registry upload">
              <div className="charter-registry-copy">
                <h4>Start faster with a registry document</h4>
                <p>Upload a yacht registry to help pre-fill basic information and specifications. Gallery, amenities, crew, pricing notes, and marketing content remain manually editable.</p>
              </div>
              <button
                aria-label="Upload yacht registry document"
                className={`upload-dropzone charter-registry-dropzone ${isRegistryDragging ? 'is-dragging' : ''}`}
                onClick={() => registryInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsRegistryDragging(true);
                }}
                onDragLeave={() => setIsRegistryDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleRegistryDrop}
                type="button"
              >
                <img className="svg-icon icon-brand-primary" src={documentIconUrl} alt="" aria-hidden="true" />
                <span>Upload registry</span>
                <small>Drag and drop or browse</small>
              </button>
              {!isManualFormVisible && (
                <div className="charter-registry-actions">
                  <button className="button button-outlined-luxury button-size-compact" type="button" onClick={() => setIsManualFormVisible(true)}>
                    Or continue manually
                  </button>
                </div>
              )}
              <input
                ref={registryInputRef}
                className="sr-only"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleRegistryUploadPlaceholder}
              />
            </aside>

            {isManualFormVisible && (
              <>
                <section className="admin-form-section" aria-labelledby="charter-basics-heading">
                  <h4 className="title-panel" id="charter-basics-heading">Basic information</h4>
	                  <div className="admin-basic-fields admin-charter-form-reveal">
	                    <div className="admin-form-row">
	                      <label>
	                        <span>Yacht name</span>
	                        <input value={form.title} onChange={(event) => updateField('title', event.target.value)} />
	                      </label>
	                      <label>
	                        <span>Slug</span>
	                        <input value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} />
	                      </label>
	                    </div>
	                    <label>
	                      <span>Short description</span>
	                      <textarea rows="3" value={form.short_description} onChange={(event) => updateField('short_description', event.target.value)} />
	                    </label>
	                    <label>
	                      <span>Full description</span>
	                      <textarea rows="7" value={form.full_description} onChange={(event) => updateField('full_description', event.target.value)} />
	                    </label>
	                    <label className="admin-checkbox-label">
	                      <input
	                        checked={form.featured}
	                        onChange={(event) => updateField('featured', event.target.checked)}
	                        type="checkbox"
	                      />
                      <span>Featured yacht</span>
                    </label>
                  </div>
                </section>

                <section className="admin-form-section" aria-labelledby="charter-pricing-heading">
                  <h4 className="title-panel" id="charter-pricing-heading">Pricing</h4>
                  <div className="admin-form-row admin-form-row-three">
                    <label>
                      <span>Currency</span>
                      <select className="select-control" value={form.currency} onChange={(event) => updateField('currency', event.target.value)}>
                        {currencyOptions.map((currency) => (
                          <option value={currency} key={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-price-field">
                      <span>
                        Price from <span className="form-label-context">({priceLabelContext})</span>
                      </span>
                      <NumberStepper label="Price from" onChange={(value) => updateField('price_from', value)} step={priceSliderStep} value={form.price_from} />
                      {formattedPricePreview && <small className="form-helper-text form-helper-text-tight">{formattedPricePreview}</small>}
                      <input
                        aria-label="Adjust price from"
                        max={priceSliderUpperLimit}
                        min="0"
                        onChange={(event) => updateField('price_from', event.target.value)}
                        step={priceSliderStep}
                        type="range"
                        value={priceSliderValue}
                      />
                    </label>
                    <label>
                      <span>Price unit</span>
                      <select className="select-control" value={form.price_unit} onChange={(event) => updateField('price_unit', event.target.value)}>
                        {priceUnitOptions.map((priceUnit) => (
                          <option value={priceUnit} key={priceUnit}>
                            {priceUnit}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    <span>Seasonal pricing notes</span>
                    <textarea rows="3" value={form.seasonal_pricing_notes} onChange={(event) => updateField('seasonal_pricing_notes', event.target.value)} />
                  </label>
                </section>

                <section className="admin-form-section" aria-labelledby="charter-location-heading">
                  <h4 className="title-panel" id="charter-location-heading">Location</h4>
                  <div className="admin-form-row">
                    <SearchableSelect
                      label="Primary region"
                      onChange={(value) => updateField('primary_region', value)}
                      options={charterRegionOptions}
                      placeholder="Search region"
                      value={form.primary_region}
                    />
                    <SearchableSelect
                      helperText="Select one or more regions"
                      label="Available regions"
                      multiple
                      onChange={(value) => updateField('available_regions', value)}
                      options={charterRegionOptions}
                      placeholder="Search regions"
                      value={form.available_regions}
                    />
                  </div>
                  <label>
                    <span>Embarkation notes</span>
                    <textarea rows="3" value={form.embarkation_notes} onChange={(event) => updateField('embarkation_notes', event.target.value)} />
                  </label>
                  <label>
                    <span>Cruising area notes</span>
                    <textarea rows="3" value={form.cruising_area_notes} onChange={(event) => updateField('cruising_area_notes', event.target.value)} />
                  </label>
                </section>

                <section className="admin-form-section" aria-labelledby="charter-specifications-heading">
                  <h4 className="title-panel" id="charter-specifications-heading">Specifications</h4>
                  <div className="charter-spec-grid">
                    <div className="charter-spec-row charter-spec-head" aria-hidden="true">
                      <span>Spec label</span>
                      <span>Value</span>
                      <span>Highlight</span>
                    </div>
                    {charterSpecRows.map((spec) => {
                      const highlightedSpecs = Array.isArray(form.highlighted_specs) ? form.highlighted_specs : [];

                      return (
                        <div className="charter-spec-row" key={spec.key}>
                          <span className="charter-spec-label">
                            <span>
                              {spec.label}
                              {spec.context && <> <span className="form-label-context">({spec.context})</span></>}
                            </span>
                          </span>
                          <span className="charter-spec-value">
                            {renderSpecInput(spec)}
                            {spec.key === 'length' && formatLengthConversion(form.length) && (
                              <small className="form-helper-text">{formatLengthConversion(form.length)}</small>
                            )}
                          </span>
                          <label className="admin-checkbox-label charter-spec-highlight">
                            <input
                              checked={highlightedSpecs.includes(spec.key)}
                              onChange={() => toggleHighlightedSpec(spec.key)}
                              type="checkbox"
                            />
                            <span>Highlighted</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            <section className="admin-form-section" aria-labelledby="charter-gallery-heading">
              <button
                aria-controls="charter-gallery-content"
                aria-expanded={optionalSectionsOpen.gallery}
                className="admin-collapsible-section-header"
                onClick={() => toggleOptionalSection('gallery')}
                type="button"
              >
                <span className="admin-collapsible-section-title">
                  <span className="title-panel" id="charter-gallery-heading">Gallery</span>
                  <span className="admin-collapsible-section-summary">{optionalSectionSummaries.gallery}</span>
                </span>
                <img className="svg-icon icon-brand-primary" src={optionalSectionsOpen.gallery ? chevronUpLargeIconUrl : chevronDownLargeIconUrl} alt="" aria-hidden="true" />
              </button>
              {optionalSectionsOpen.gallery && (
              <div className="admin-collapsible-section-content" id="charter-gallery-content">
              <button
                aria-label="Upload charter gallery images"
                className={`upload-dropzone charter-gallery-dropzone ${isGalleryDragging ? 'is-dragging' : ''}`}
                disabled={isUploadingGallery}
                onClick={() => galleryInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsGalleryDragging(true);
                }}
                onDragLeave={() => setIsGalleryDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleGalleryDrop}
                type="button"
              >
                <img className="svg-icon icon-brand-primary" src={documentIconUrl} alt="" aria-hidden="true" />
                <span>{isUploadingGallery ? 'Uploading gallery images' : 'Upload gallery images'}</span>
                <small>{isUploadingGallery ? 'Please wait while images upload' : 'Drag and drop multiple images or browse'}</small>
              </button>
              <input
                ref={galleryInputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleGalleryInputChange}
              />
              {galleryUrlRows.length > 0 && (
                <div className="gallery-url-rows">
                  {galleryUrlRows.map((row) => (
                    <div className="gallery-url-row" key={row.id}>
                      <label>
                        <span>Image URL</span>
                        <input
                          placeholder="https://..."
                          value={row.value}
                          onChange={(event) => updateGalleryUrlRow(row.id, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleAddGalleryImageUrl(row.id);
                            }
                          }}
                        />
                      </label>
                      <button className="button button-primary button-size-compact gallery-url-save-button" type="button" onClick={() => handleAddGalleryImageUrl(row.id)}>
                        Save
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button className="admin-text-button gallery-url-add-action" type="button" onClick={handleAddGalleryUrlRow}>
                <span className="gallery-url-plus" aria-hidden="true">+</span>
                Add image URL
              </button>
              {galleryImages.length > 0 ? (
                <div className="charter-gallery-grid">
                  {galleryImages.map((image) => (
                    <article
                      className={`charter-gallery-card ${draggingGalleryImageId === image.id ? 'is-dragging' : ''}`}
                      draggable
                      key={image.id}
                      onDragEnd={() => setDraggingGalleryImageId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={(event) => {
                        const interactiveElement = event.target.closest('input, textarea, button, label, select, a');

                        if (interactiveElement) {
                          event.preventDefault();
                          return;
                        }

                        setDraggingGalleryImageId(image.id);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', image.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const sourceId = event.dataTransfer.getData('text/plain') || draggingGalleryImageId;
                        moveGalleryImage(sourceId, image.id);
                        setDraggingGalleryImageId(null);
                      }}
                      tabIndex={0}
                    >
                      <img src={image.image_url} alt={image.alt_text || image.caption || ''} />
                      <label>
                        <span>Caption</span>
                        <input
                          value={image.caption ?? ''}
                          onChange={(event) => updateGalleryImage(image.id, { caption: event.target.value || null })}
                        />
                      </label>
                      <label>
                        <span>Alt text</span>
                        <input
                          value={image.alt_text ?? ''}
                          onChange={(event) => updateGalleryImage(image.id, { alt_text: event.target.value || null })}
                        />
                      </label>
                      <div className="charter-gallery-meta-row">
                        <label className="admin-checkbox-label">
                          <input
                            checked={Boolean(image.is_featured)}
                            onChange={() => handleGalleryFeaturedChange(image.id)}
                            type="checkbox"
                          />
                          <span>Featured</span>
                        </label>
                        <AdminActionButton
                          className="admin-action-button-quiet admin-action-button-destructive"
                          type="button"
                          onClick={() => handleGalleryDelete(image.id)}
                          label="Remove gallery image"
                        >
                          <img className="svg-icon icon-destructive" src={trashIconUrl} alt="" aria-hidden="true" />
                        </AdminActionButton>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-state">No gallery images yet.</p>
              )}
              </div>
              )}
            </section>

            <section className="admin-form-section" aria-labelledby="charter-amenities-heading">
              <button
                aria-controls="charter-amenities-content"
                aria-expanded={optionalSectionsOpen.amenities}
                className="admin-collapsible-section-header"
                onClick={() => toggleOptionalSection('amenities')}
                type="button"
              >
                <span className="admin-collapsible-section-title">
                  <span className="title-panel" id="charter-amenities-heading">Amenities</span>
                  <span className="admin-collapsible-section-summary">{optionalSectionSummaries.amenities}</span>
                </span>
                <img className="svg-icon icon-brand-primary" src={optionalSectionsOpen.amenities ? chevronUpLargeIconUrl : chevronDownLargeIconUrl} alt="" aria-hidden="true" />
              </button>
              {optionalSectionsOpen.amenities && (
              <div className="admin-collapsible-section-content" id="charter-amenities-content">
              {amenityLibrary.length === 0 ? (
                <p className="admin-empty-state">No active amenities yet. Add amenities in Admin - Amenities.</p>
              ) : (
                <div className="charter-amenity-selection-list">
                  {amenityCategories.map((category) => {
                    const categoryAmenities = amenityLibraryByCategory.get(category.id) ?? [];
                    if (categoryAmenities.length === 0) return null;

                    return (
                      <fieldset className="charter-amenity-selection-group" key={category.id}>
                        <legend>{category.name}</legend>
                        <div className="charter-amenity-chip-list">
                          {categoryAmenities.map((amenity) => {
                            const isSelected = selectedAmenityIds.includes(amenity.id);

                            return (
                              <button
                                aria-pressed={isSelected}
                                className={`charter-amenity-chip ${isSelected ? 'is-selected' : ''}`}
                                key={amenity.id}
                                onClick={() => toggleSelectedAmenity(amenity.id)}
                                type="button"
                              >
                                <img className={`svg-icon ${isSelected ? 'icon-on-brand-primary' : 'icon-brand-primary'}`} src={getAmenityIconUrl(amenity.icon)} alt="" aria-hidden="true" />
                                <span>{amenity.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>
              )}
              </div>
              )}
            </section>

            <section className="admin-form-section" aria-labelledby="charter-crew-heading">
              <button
                aria-controls="charter-crew-content"
                aria-expanded={optionalSectionsOpen.crew}
                className="admin-collapsible-section-header"
                onClick={() => toggleOptionalSection('crew')}
                type="button"
              >
                <span className="admin-collapsible-section-title">
                  <span className="title-panel" id="charter-crew-heading">Crew profiles</span>
                  <span className="admin-collapsible-section-summary">{optionalSectionSummaries.crew}</span>
                </span>
                <img className="svg-icon icon-brand-primary" src={optionalSectionsOpen.crew ? chevronUpLargeIconUrl : chevronDownLargeIconUrl} alt="" aria-hidden="true" />
              </button>
              {optionalSectionsOpen.crew && (
              <div className="admin-collapsible-section-content" id="charter-crew-content">
              <div className="admin-panel-title-row">
                <button className="button button-primary button-size-compact" type="button" onClick={addCrewProfile}>
                  Add crew profile
                </button>
              </div>
              {crewProfiles.length > 0 ? (
                <div className="charter-crew-grid">
                  {crewProfiles.map((profile) => (
                    <article
                      className={`charter-crew-card ${draggingCrewProfileId === profile.id ? 'is-dragging' : ''}`}
                      draggable
                      key={profile.id}
                      onDragEnd={() => setDraggingCrewProfileId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={(event) => {
                        const interactiveElement = event.target.closest('input, textarea, button, label, select, a');

                        if (interactiveElement) {
                          event.preventDefault();
                          return;
                        }

                        setDraggingCrewProfileId(profile.id);
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', profile.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const sourceId = event.dataTransfer.getData('text/plain') || draggingCrewProfileId;
                        moveCrewProfile(sourceId, profile.id);
                        setDraggingCrewProfileId(null);
                      }}
                      tabIndex={0}
                    >
                      <div className="charter-crew-card-header">
                        <label
                          className="upload-dropzone charter-crew-avatar-dropzone"
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleCrewAvatarFile(profile.id, event.dataTransfer.files?.[0]);
                          }}
                        >
                          <input
                            className="sr-only"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => handleCrewAvatarInputChange(profile.id, event)}
                          />
                          {profile.avatar_image ? (
                            <img className="charter-crew-avatar-image" src={profile.avatar_image} alt="" aria-hidden="true" />
                          ) : (
                            <span className="charter-crew-avatar-initials">{getCrewInitials(profile.crew_name)}</span>
                          )}
                          <small>{uploadingCrewProfileId === profile.id ? 'Uploading' : 'Upload avatar'}</small>
                        </label>
                        <AdminActionButton
                          className="admin-action-button-quiet admin-action-button-destructive"
                          type="button"
                          onClick={() => removeCrewProfile(profile.id)}
                          label="Remove crew profile"
                        >
                          <img className="svg-icon icon-destructive" src={trashIconUrl} alt="" aria-hidden="true" />
                        </AdminActionButton>
                      </div>
                      <label>
                        <span>Crew name</span>
                        <input
                          value={profile.crew_name ?? ''}
                          onChange={(event) => updateCrewProfile(profile.id, { crew_name: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>Role / position</span>
                        <input
                          value={profile.role ?? ''}
                          onChange={(event) => updateCrewProfile(profile.id, { role: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>Avatar image URL</span>
                        <input
                          placeholder="https://..."
                          value={profile.avatar_image ?? ''}
                          onChange={(event) => updateCrewProfile(profile.id, { avatar_image: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>Bio / details</span>
                        <textarea
                          rows="4"
                          value={profile.bio ?? ''}
                          onChange={(event) => updateCrewProfile(profile.id, { bio: event.target.value })}
                        />
                      </label>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-state">No crew profiles yet.</p>
              )}
              </div>
              )}
            </section>

            <button className="button button-primary button-size-compact admin-save-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Create charter'}
            </button>
          </form>
        </section>
      )}

      <section className="admin-card admin-table-card">
        <div className="admin-card-header">
          <div>
            <h3 className="title-section">Manage charters</h3>
          </div>
          <button className="button button-primary button-size-compact admin-add-button" type="button" onClick={openCreateForm}>
            Add charter
          </button>
        </div>

        {isLoading ? (
          <p className="admin-empty-state">Loading charters...</p>
        ) : sortedCharters.length === 0 ? (
          <p className="admin-empty-state">No charter records yet. Add the first charter yacht.</p>
        ) : (
          <div className="admin-cms-table" role="table" aria-label="Charter records">
            <div className="admin-cms-row admin-charters-row admin-cms-head" role="row">
              <span>Yacht Name</span>
              <span>Primary Region</span>
              <span>Price From</span>
              <span>Featured</span>
              <span>Status</span>
              <span>Updated</span>
              <span>Actions</span>
            </div>
            {sortedCharters.map((charter) => (
              <div className="admin-cms-row admin-charters-row" role="row" key={charter.id}>
                <span>
                  <button
                    aria-label={`Open details for ${charter.title}`}
                    className="admin-row-title-link"
                    onClick={() => openEditForm(charter)}
                    type="button"
                  >
                    <strong>{charter.title}</strong>
                  </button>
                </span>
                <span>{charter.primary_region || '-'}</span>
                <span>{formatPrice(charter.price_from, charter.currency, charter.price_unit)}</span>
                <span>{charter.featured ? 'Yes' : 'No'}</span>
                <span>
                  <div className="admin-status-menu-wrap">
                    <button
                      aria-expanded={openStatusMenuId === charter.id}
                      aria-haspopup="menu"
                      aria-label={`Update status for ${charter.title}`}
                      className={`admin-status admin-status-${getStatusTone(charter.status)} admin-status-trigger`}
                      onClick={(event) => toggleTableStatusMenu(charter.id, event)}
                      type="button"
                    >
                      <span>{formatStatusLabel(charter.status)}</span>
                      <img className="svg-icon" src={chevronDownIconUrl} alt="" aria-hidden="true" />
                    </button>
                  </div>
                </span>
                <span>{formatDate(charter.updated_at)}</span>
                <span className="admin-table-actions">
                  <AdminActionButton type="button" onClick={() => openEditForm(charter)} label={`Edit ${charter.title}`}>
                    <img className="admin-action-icon" src={editIconUrl} alt="" aria-hidden="true" />
                    <span className="sr-only">Edit {charter.title}</span>
                  </AdminActionButton>
                  <AdminActionButton className="admin-action-button-destructive" type="button" onClick={() => handleDelete(charter)} label={`Delete ${charter.title}`}>
                    <img className="admin-action-icon icon-destructive" src={trashIconUrl} alt="" aria-hidden="true" />
                    <span className="sr-only">Delete {charter.title}</span>
                  </AdminActionButton>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      {openStatusMenuId && statusMenuPosition && createPortal(
        <div
          className="admin-status-menu"
          role="menu"
          style={{
            left: statusMenuPosition.left,
            minWidth: statusMenuPosition.minWidth,
            top: statusMenuPosition.top,
          }}
        >
          {charterStatusOptions
            .filter((statusOption) => statusOption !== charters.find((charter) => charter.id === openStatusMenuId)?.status)
            .map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => handleTableStatusChange(openStatusMenuId, statusOption)}
                role="menuitem"
                type="button"
              >
                <StatusBadge status={statusOption} />
              </button>
            ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
