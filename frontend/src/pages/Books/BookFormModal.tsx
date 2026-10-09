import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Book } from '../../types';
import { authorApi, categoryApi, bookApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Sparkles, Wand2, MapPin, Image as ImageIcon, Plus, Check } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  bookToEdit?: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

const sampleCoverImages = [
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?w=400',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
];

const rackOptions = [
  'Rack A-1 (Shelf CS-01)',
  'Rack A-1 (Shelf CS-02)',
  'Rack A-2 (Shelf CS-03)',
  'Rack A-2 (Shelf CS-04)',
  'Rack B-1 (Shelf DS-01)',
  'Rack B-2 (Shelf DS-02)',
  'Rack C-1 (Shelf AL-01)',
  'Rack C-2 (Shelf AL-02)',
  'Rack D-1 (Shelf LIT-01)',
  'Rack D-2 (Shelf LIT-02)',
  'Rack E-1 (Shelf AI-01)',
  'Rack E-2 (Shelf CLOUD-01)',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  bookToEdit,
  onClose,
  onSuccess,
}) => {
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [totalCopies, setTotalCopies] = useState<number>(3);
  const [shelfLocation, setShelfLocation] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [showAddAuthor, setShowAddAuthor] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: authorsData, refetch: refetchAuthors } = useQuery({
    queryKey: ['authors'],
    queryFn: authorApi.getAll,
  });

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  useEffect(() => {
    if (bookToEdit) {
      setIsbn(bookToEdit.isbn);
      setTitle(bookToEdit.title);
      setSubtitle(bookToEdit.subtitle || '');
      setPublisher(bookToEdit.publisher || '');
      setPublicationYear(bookToEdit.publicationYear || new Date().getFullYear());
      setDescription(bookToEdit.description || '');
      setLanguage(bookToEdit.language || 'English');
      setTotalCopies(bookToEdit.totalCopies);
      setShelfLocation(bookToEdit.shelfLocation || '');
      setCoverImageUrl(bookToEdit.coverImageUrl || '');
      setSelectedAuthorIds(bookToEdit.authors?.map((a) => a.id) || []);
      setSelectedCategoryIds(bookToEdit.categories?.map((c) => c.id) || []);
    } else {
      setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
      setTitle('');
      setSubtitle('');
      setPublisher('LibMaster Academic Press');
      setPublicationYear(new Date().getFullYear());
      setDescription('');
      setLanguage('English');
      setTotalCopies(4);
      setShelfLocation(rackOptions[Math.floor(Math.random() * rackOptions.length)]);
      setCoverImageUrl(sampleCoverImages[Math.floor(Math.random() * sampleCoverImages.length)]);
      setSelectedAuthorIds(['a1']);
      setSelectedCategoryIds(['c1']);
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleGenerateIsbn = () => {
    const randomIsbn = `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setIsbn(randomIsbn);
  };

  const handleSuggestRack = () => {
    const randomRack = rackOptions[Math.floor(Math.random() * rackOptions.length)];
    setShelfLocation(randomRack);
  };

  const handleRandomCover = () => {
    const randomImg = sampleCoverImages[Math.floor(Math.random() * sampleCoverImages.length)];
    setCoverImageUrl(randomImg);
  };

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) return;
    try {
      const res = await authorApi.create({ name: newAuthorName.trim() });
      if (res.data) {
        await refetchAuthors();
        setSelectedAuthorIds((prev) => [...prev, res.data.id]);
        setNewAuthorName('');
        setShowAddAuthor(false);
        success(`Author "${res.data.name}" added`);
      }
    } catch {
      error('Could not add author');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await categoryApi.create({ name: newCategoryName.trim() });
      if (res.data) {
        await refetchCategories();
        setSelectedCategoryIds((prev) => [...prev, res.data.id]);
        setNewCategoryName('');
        setShowAddCategory(false);
        success(`Category "${res.data.name}" added`);
      }
    } catch {
      error('Could not add category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Book title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        isbn: isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        publisher: publisher.trim() || 'LibMaster Publishing',
        publicationYear: Number(publicationYear) || new Date().getFullYear(),
        description: description.trim() || `Published book indexed in ${shelfLocation || 'Main Stacks Rack'}.`,
        language: language || 'English',
        totalCopies: Number(totalCopies) || 1,
        availableCopies: Number(totalCopies) || 1,
        borrowedCopies: 0,
        shelfLocation: shelfLocation.trim() || 'Rack A-1 (Shelf CS-01)',
        coverImageUrl: coverImageUrl.trim() || sampleCoverImages[0],
        authorIds: selectedAuthorIds.length > 0 ? selectedAuthorIds : ['a1'],
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : ['c1'],
      };

      if (bookToEdit) {
        await bookApi.update(bookToEdit.id, payload);
        success(`Book "${payload.title}" updated in rack location ${payload.shelfLocation}`);
      } else {
        await bookApi.create(payload);
        success(`Book "${payload.title}" created & cataloged in ${payload.shelfLocation}`);
      }

      // Invalidate relevant react-query caches
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to save book record';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthor = (id: string) => {
    setSelectedAuthorIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {bookToEdit ? 'Edit Book Record' : 'Add New Book to Rack Catalog'}
              </h3>
              <p className="text-xs text-slate-500">
                Place physical book copies directly onto library inventory racks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  ISBN-13 <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateIsbn}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Gen
                </button>
              </div>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0132350884"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Book Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean Architecture & Microservices"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A Craftsman's Guide to Software Structure"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Prentice Hall / O'Reilly"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Publication Year
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Total Copies on Rack <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Rack & Shelf Location
                </label>
                <button
                  type="button"
                  onClick={handleSuggestRack}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3 h-3" /> Suggest
                </button>
              </div>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Rack A-1 (Shelf CS-01)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Cover Image URL
              </label>
              <button
                type="button"
                onClick={handleRandomCover}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <ImageIcon className="w-3 h-3" /> Sample Cover
              </button>
            </div>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Synopsis & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive summary and overview of the book contents..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Authors select chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Authors ({selectedAuthorIds.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setShowAddAuthor(!showAddAuthor)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> New Author
              </button>
            </div>

            {showAddAuthor && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="Author full name..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleCreateAuthor}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {authorsData?.data?.map((author) => {
                const isSelected = selectedAuthorIds.includes(author.id);
                return (
                  <button
                    key={author.id}
                    type="button"
                    onClick={() => toggleAuthor(author.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {author.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories select chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Categories ({selectedCategoryIds.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> New Category
              </button>
            </div>

            {showAddCategory && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category title..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {categoriesData?.data?.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {bookToEdit ? 'Save Changes' : 'Publish & Place on Rack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
