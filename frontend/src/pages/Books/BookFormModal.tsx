import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from '../../types';
import { authorApi, categoryApi, bookApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X } from 'lucide-react';

interface BookFormModalProps {
  isOpen: boolean;
  bookToEdit?: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

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
  const [publicationYear, setPublicationYear] = useState<number>(2024);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [shelfLocation, setShelfLocation] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: authorApi.getAll,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  useEffect(() => {
    if (bookToEdit) {
      setIsbn(bookToEdit.isbn);
      setTitle(bookToEdit.title);
      setSubtitle(bookToEdit.subtitle || '');
      setPublisher(bookToEdit.publisher || '');
      setPublicationYear(bookToEdit.publicationYear || 2024);
      setDescription(bookToEdit.description || '');
      setLanguage(bookToEdit.language || 'English');
      setTotalCopies(bookToEdit.totalCopies);
      setShelfLocation(bookToEdit.shelfLocation || '');
      setCoverImageUrl(bookToEdit.coverImageUrl || '');
      setSelectedAuthorIds(bookToEdit.authors?.map((a) => a.id) || []);
      setSelectedCategoryIds(bookToEdit.categories?.map((c) => c.id) || []);
    } else {
      setIsbn('');
      setTitle('');
      setSubtitle('');
      setPublisher('');
      setPublicationYear(new Date().getFullYear());
      setDescription('');
      setLanguage('English');
      setTotalCopies(1);
      setShelfLocation('');
      setCoverImageUrl('');
      setSelectedAuthorIds([]);
      setSelectedCategoryIds([]);
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        isbn,
        title,
        subtitle: subtitle || undefined,
        publisher: publisher || undefined,
        publicationYear: Number(publicationYear),
        description: description || undefined,
        language,
        totalCopies: Number(totalCopies),
        shelfLocation: shelfLocation || undefined,
        coverImageUrl: coverImageUrl || undefined,
        authorIds: selectedAuthorIds,
        categoryIds: selectedCategoryIds,
      };

      if (bookToEdit) {
        await bookApi.update(bookToEdit.id, payload);
        success('Book details updated successfully');
      } else {
        await bookApi.create(payload);
        success('Book created and added to catalog');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to save book';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {bookToEdit ? 'Edit Book Record' : 'Add New Book to Catalog'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                ISBN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0132350884"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Clean Code"
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
                placeholder="A Handbook of Agile Craftsmanship"
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
                placeholder="Prentice Hall"
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
                Total Copies <span className="text-rose-500">*</span>
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
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Shelf Location
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Shelf CS-01"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Cover Image URL
            </label>
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
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Book summary and overview..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Authors select chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Authors
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {authorsData?.data?.map((author) => {
                const isSelected = selectedAuthorIds.includes(author.id);
                return (
                  <button
                    key={author.id}
                    type="button"
                    onClick={() => toggleAuthor(author.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {author.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories select chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Categories
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {categoriesData?.data?.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
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
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md shadow-emerald-600/20"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {bookToEdit ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
