/**
 * GrammarFormModal
 *
 * Used for both creating and editing grammar rules.
 * Props:
 *   isOpen     — boolean
 *   onClose    — () => void
 *   onSave     — (fields) => { ok, error? }   (calls createGrammarItem or updateGrammarItem)
 *   initial    — grammar item to pre-fill when editing (undefined = new)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiStar, FiInfo } from 'react-icons/fi';
import Dialog from './common/Dialog';
import Button from './common/Button';

// ── constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS = [
  { value: 'Principiante', label: 'Principiante (A1–A2)', color: 'text-brand-green' },
  { value: 'Intermedio',   label: 'Intermedio   (B1–B2)', color: 'text-brand-navy'  },
  { value: 'Avanzato',     label: 'Avanzato     (C1–C2)', color: 'text-brand-red'   },
];

const EMPTY_EXAMPLE = { it: '', ar: '' };

const EMPTY_FORM = {
  title: '',
  arabicTitle: '',
  italianExplanation: '',
  arabicExplanation: '',
  examples: [{ ...EMPTY_EXAMPLE }],
  difficulty: 'Principiante',
  tags: '',
  favorite: false,
};

// ── helpers ──────────────────────────────────────────────────────────────────

function itemToForm(item) {
  if (!item) return { ...EMPTY_FORM, examples: [{ ...EMPTY_EXAMPLE }] };
  return {
    title:              item.title              ?? '',
    arabicTitle:        item.arabicTitle        ?? '',
    italianExplanation: item.explanationItalian ?? item.italianExplanation ?? '',
    arabicExplanation:  item.explanationArabic  ?? item.arabicExplanation  ?? '',
    examples:           item.examples?.length ? item.examples.map(e => ({ it: e.it ?? '', ar: e.ar ?? '' })) : [{ ...EMPTY_EXAMPLE }],
    difficulty:         item.difficulty         ?? 'Principiante',
    tags:               Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags ?? ''),
    favorite:           item.favorite           ?? false,
  };
}

// ── sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
      {children}
      {required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-brand-red font-medium">{msg}</p>;
}

function textareaClass(hasError) {
  return [
    'w-full px-4 py-2.5 bg-white text-brand-navy border rounded-xl font-sans text-sm',
    'transition-all focus:outline-none focus:ring-2 resize-none',
    hasError
      ? 'border-brand-red focus:ring-brand-red/30 focus:border-brand-red'
      : 'border-brand-navy/15 hover:border-brand-navy/30 focus:ring-brand-green/30 focus:border-brand-green',
  ].join(' ');
}

function inputClass(hasError) {
  return [
    'w-full px-4 py-2.5 bg-white text-brand-navy border rounded-xl font-sans text-sm',
    'transition-all focus:outline-none focus:ring-2',
    hasError
      ? 'border-brand-red focus:ring-brand-red/30 focus:border-brand-red'
      : 'border-brand-navy/15 hover:border-brand-navy/30 focus:ring-brand-green/30 focus:border-brand-green',
  ].join(' ');
}

// ── main component ────────────────────────────────────────────────────────────

const GrammarFormModal = ({ isOpen, onClose, onSave, initial }) => {
  const isEditing = Boolean(initial?.id);

  const [form,   setForm]   = useState(() => itemToForm(initial));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  // Re-seed form when `initial` changes (switching from add→edit)
  useEffect(() => {
    if (isOpen) {
      setForm(itemToForm(initial));
      setErrors({});
      setApiErr('');
    }
  }, [isOpen, initial]);

  // ── field setters ───────────────────────────────────────────────────────

  const set = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  const setExample = useCallback((idx, key, value) => {
    setForm(prev => {
      const examples = prev.examples.map((ex, i) => i === idx ? { ...ex, [key]: value } : ex);
      return { ...prev, examples };
    });
  }, []);

  const addExample = () =>
    setForm(prev => ({ ...prev, examples: [...prev.examples, { ...EMPTY_EXAMPLE }] }));

  const removeExample = (idx) =>
    setForm(prev => ({
      ...prev,
      examples: prev.examples.length > 1 ? prev.examples.filter((_, i) => i !== idx) : prev.examples,
    }));

  // ── validation ──────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.title.trim())              e.title              = 'Il titolo è obbligatorio.';
    if (!form.italianExplanation.trim()) e.italianExplanation = 'La spiegazione in italiano è obbligatoria.';
    if (!form.arabicExplanation.trim())  e.arabicExplanation  = 'الشرح بالعربية مطلوب.';
    return e;
  };

  // ── submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiErr('');

    const result = await onSave({
      ...(isEditing ? { id: initial.id } : {}),
      title:              form.title.trim(),
      arabicTitle:        form.arabicTitle.trim(),
      italianExplanation: form.italianExplanation.trim(),
      arabicExplanation:  form.arabicExplanation.trim(),
      examples:           form.examples.filter(ex => ex.it.trim()),
      difficulty:         form.difficulty,
      tags:               form.tags,
      favorite:           form.favorite,
      // preserve original source when editing
      ...(isEditing ? { source: initial.source } : { source: 'manual' }),
    });

    setSaving(false);

    if (result?.ok === false) {
      setApiErr(result.error || 'Errore durante il salvataggio.');
    } else {
      onClose();
    }
  };

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '✏️ Modifica Regola Grammaticale' : '➕ Aggiungi Regola Grammaticale'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* API-level error */}
        {apiErr && (
          <div className="flex items-start gap-2 px-4 py-3 bg-brand-red/8 border border-brand-red/20 rounded-xl text-xs text-brand-red font-medium">
            <FiInfo size={14} className="shrink-0 mt-0.5" />
            {apiErr}
          </div>
        )}

        {/* ── Row 1: Title + Arabic Title ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Titolo della Regola</FieldLabel>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="es. Passato Prossimo"
              className={inputClass(errors.title)}
              maxLength={120}
            />
            <FieldError msg={errors.title} />
          </div>
          <div>
            <FieldLabel>عنوان بالعربية (اختياري)</FieldLabel>
            <input
              value={form.arabicTitle}
              onChange={e => set('arabicTitle', e.target.value)}
              placeholder="مثال: زمن الماضي القريب"
              className={inputClass(false)}
              dir="rtl"
              maxLength={120}
            />
          </div>
        </div>

        {/* ── Row 2: Difficulty + Favorite ── */}
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <div>
            <FieldLabel>Livello / المستوى</FieldLabel>
            <select
              value={form.difficulty}
              onChange={e => set('difficulty', e.target.value)}
              className={inputClass(false)}
            >
              {DIFFICULTY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Tags (separati da virgola)</FieldLabel>
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="es. Passato, Ausiliare, B1"
              className={inputClass(false)}
            />
          </div>
        </div>

        {/* ── Row 3: Italian Explanation ── */}
        <div>
          <FieldLabel required>Spiegazione in Italiano 🇮🇹</FieldLabel>
          <textarea
            value={form.italianExplanation}
            onChange={e => set('italianExplanation', e.target.value)}
            rows={3}
            placeholder="Spiega la regola grammaticale in italiano..."
            className={textareaClass(errors.italianExplanation)}
          />
          <FieldError msg={errors.italianExplanation} />
        </div>

        {/* ── Row 4: Arabic Explanation ── */}
        <div>
          <FieldLabel required>الشرح بالعربية 🇪🇬 *</FieldLabel>
          <textarea
            value={form.arabicExplanation}
            onChange={e => set('arabicExplanation', e.target.value)}
            rows={3}
            dir="rtl"
            placeholder="اشرح القاعدة النحوية باللغة العربية..."
            className={textareaClass(errors.arabicExplanation)}
          />
          <FieldError msg={errors.arabicExplanation} />
        </div>

        {/* ── Row 5: Examples ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FieldLabel>Esempi Pratici / أمثلة تطبيقية</FieldLabel>
            <button
              type="button"
              onClick={addExample}
              className="text-[11px] text-brand-green font-bold flex items-center gap-1 hover:text-[#097b46] transition-colors cursor-pointer"
            >
              <FiPlus size={13} />
              Aggiungi esempio
            </button>
          </div>

          {form.examples.map((ex, idx) => (
            <div key={idx} className="flex gap-2 items-start group">
              <span className="mt-2.5 text-[10px] font-bold text-brand-navy/40 w-4 shrink-0">{idx + 1}.</span>
              <div className="flex-1 grid sm:grid-cols-2 gap-2">
                <input
                  value={ex.it}
                  onChange={e => setExample(idx, 'it', e.target.value)}
                  placeholder="🇮🇹 Frase italiana..."
                  className={inputClass(false)}
                />
                <input
                  value={ex.ar}
                  onChange={e => setExample(idx, 'ar', e.target.value)}
                  placeholder="🇪🇬 الترجمة العربية..."
                  className={inputClass(false)}
                  dir="rtl"
                />
              </div>
              {form.examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExample(idx)}
                  className="mt-2.5 text-brand-navy/30 hover:text-brand-red transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  aria-label="Rimuovi esempio"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Row 6: Favorite toggle ── */}
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <div
            className={[
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
              form.favorite
                ? 'bg-amber-400 border-amber-400'
                : 'border-brand-navy/20 group-hover:border-amber-400',
            ].join(' ')}
            onClick={() => set('favorite', !form.favorite)}
          >
            {form.favorite && <FiStar size={11} className="text-white fill-white" />}
          </div>
          <span className="text-sm font-medium text-brand-navy">
            Aggiungi ai preferiti ⭐
          </span>
        </label>

        {/* ── Footer buttons ── */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Annulla
          </Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            {isEditing ? 'Aggiorna Regola' : 'Salva Regola'}
          </Button>
        </div>

      </form>
    </Dialog>
  );
};

export default GrammarFormModal;
