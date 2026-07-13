/**
 * VocabularyFormModal
 *
 * Used for both creating and editing vocabulary items.
 * When partOfSpeech === 'Verbo', a full conjugation section is revealed.
 *
 * Props:
 *   isOpen   — boolean
 *   onClose  — () => void
 *   onSave   — (fields) => { ok, error? }
 *   initial  — vocab item to pre-fill when editing (undefined = new)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiInfo, FiStar, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Dialog from './common/Dialog';
import Button from './common/Button';

// ── constants ────────────────────────────────────────────────────────────────

const POS_OPTIONS = [
  'Verbo', 'Sostantivo', 'Aggettivo', 'Avverbio',
  'Espressione', 'Pronome', 'Articolo', 'Preposizione',
  'Congiunzione', 'Interiezione', 'Altro',
];

const AUXILIARY_OPTIONS = ['Avere', 'Essere'];
const EMPTY_VERB_EXAMPLE = { it: '', ar: '' };

const EMPTY_VERB = {
  infinitive: '', meaning: '', presentTense: '', pastTense: '',
  future: '', imperative: '', pastParticiple: '',
  reflexive: false, auxiliary: 'Avere', conjugationNotes: '', irregular: false,
  examples: [{ ...EMPTY_VERB_EXAMPLE }],
};

const EMPTY_FORM = {
  italianWord: '', arabicTranslation: '', pronunciation: '',
  partOfSpeech: 'Sostantivo', example: '', arabicExample: '', notes: '',
  favorite: false, verbData: { ...EMPTY_VERB },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function itemToForm(item) {
  if (!item) return { ...EMPTY_FORM, verbData: { ...EMPTY_VERB, examples: [{ ...EMPTY_VERB_EXAMPLE }] } };
  return {
    italianWord:      item.italianWord      ?? '',
    arabicTranslation: item.arabicTranslation ?? '',
    pronunciation:    item.pronunciation    ?? '',
    partOfSpeech:     item.partOfSpeech     ?? 'Sostantivo',
    example:          item.example          ?? '',
    arabicExample:    item.arabicExample    ?? '',
    notes:            item.notes            ?? '',
    favorite:         item.favorite         ?? false,
    verbData: item.verbData ? {
      infinitive:       item.verbData.infinitive       ?? '',
      meaning:          item.verbData.meaning          ?? '',
      presentTense:     item.verbData.presentTense     ?? '',
      pastTense:        item.verbData.pastTense        ?? '',
      future:           item.verbData.future           ?? '',
      imperative:       item.verbData.imperative       ?? '',
      pastParticiple:   item.verbData.pastParticiple   ?? '',
      reflexive:        item.verbData.reflexive        ?? false,
      auxiliary:        item.verbData.auxiliary        ?? 'Avere',
      conjugationNotes: item.verbData.conjugationNotes ?? '',
      irregular:        item.verbData.irregular        ?? false,
      examples:         item.verbData.examples?.length
        ? item.verbData.examples.map(e => ({ it: e.it ?? '', ar: e.ar ?? '' }))
        : [{ ...EMPTY_VERB_EXAMPLE }],
    } : { ...EMPTY_VERB, examples: [{ ...EMPTY_VERB_EXAMPLE }] },
  };
}

// ── shared field primitives ───────────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
      {children}{required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  );
}
function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-brand-red font-medium">{msg}</p>;
}
function inputCls(err) {
  return [
    'w-full px-4 py-2.5 bg-white text-brand-navy border rounded-xl font-sans text-sm',
    'transition-all focus:outline-none focus:ring-2',
    err
      ? 'border-brand-red focus:ring-brand-red/30 focus:border-brand-red'
      : 'border-brand-navy/15 hover:border-brand-navy/30 focus:ring-brand-green/30 focus:border-brand-green',
  ].join(' ');
}
function textareaCls(err) {
  return inputCls(err) + ' resize-none';
}
function selectCls() {
  return inputCls(false);
}

// ── VerbSection sub-component ─────────────────────────────────────────────────

function VerbSection({ verbData, onChange }) {
  const [expanded, setExpanded] = useState(true);

  const set = (key, val) => onChange({ ...verbData, [key]: val });
  const setEx = (idx, key, val) => {
    const examples = verbData.examples.map((e, i) => i === idx ? { ...e, [key]: val } : e);
    onChange({ ...verbData, examples });
  };
  const addEx  = () => onChange({ ...verbData, examples: [...verbData.examples, { ...EMPTY_VERB_EXAMPLE }] });
  const rmEx   = (idx) => onChange({
    ...verbData,
    examples: verbData.examples.length > 1 ? verbData.examples.filter((_, i) => i !== idx) : verbData.examples,
  });

  return (
    <div className="border border-brand-green/20 rounded-2xl overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-green/5 hover:bg-brand-green/10 transition-colors cursor-pointer"
      >
        <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
          🇮🇹 Tabella di Coniugazione / جدول التصريف
        </span>
        {expanded ? <FiChevronUp size={15} className="text-brand-green" /> : <FiChevronDown size={15} className="text-brand-green" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Row: Infinitive + Meaning */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Infinito</FieldLabel>
              <input value={verbData.infinitive} onChange={e => set('infinitive', e.target.value)} placeholder="es. mangiare" className={inputCls(false)} />
            </div>
            <div>
              <FieldLabel>المعنى بالعربية</FieldLabel>
              <input value={verbData.meaning} onChange={e => set('meaning', e.target.value)} placeholder="مثال: يأكل" className={inputCls(false)} dir="rtl" />
            </div>
          </div>

          {/* Row: Present + Past */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Presente Indicativo</FieldLabel>
              <textarea value={verbData.presentTense} onChange={e => set('presentTense', e.target.value)} rows={3} placeholder="io ..., tu ..., lui/lei ..., noi ..., voi ..., loro ..." className={textareaCls(false)} />
            </div>
            <div>
              <FieldLabel>Passato Prossimo</FieldLabel>
              <textarea value={verbData.pastTense} onChange={e => set('pastTense', e.target.value)} rows={3} placeholder="ho/sono + participio passato" className={textareaCls(false)} />
            </div>
          </div>

          {/* Row: Future + Imperative */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Futuro Semplice</FieldLabel>
              <input value={verbData.future} onChange={e => set('future', e.target.value)} placeholder="es. mangerò..." className={inputCls(false)} />
            </div>
            <div>
              <FieldLabel>Imperativo</FieldLabel>
              <input value={verbData.imperative} onChange={e => set('imperative', e.target.value)} placeholder="es. mangia! (tu)" className={inputCls(false)} />
            </div>
          </div>

          {/* Row: Past Participle + Auxiliary */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Participio Passato</FieldLabel>
              <input value={verbData.pastParticiple} onChange={e => set('pastParticiple', e.target.value)} placeholder="es. mangiato" className={inputCls(false)} />
            </div>
            <div>
              <FieldLabel>Verbo Ausiliare</FieldLabel>
              <select value={verbData.auxiliary} onChange={e => set('auxiliary', e.target.value)} className={selectCls()}>
                {AUXILIARY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Reflexive + Irregular */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-navy">
              <input type="checkbox" checked={verbData.reflexive} onChange={e => set('reflexive', e.target.checked)} className="accent-brand-green w-4 h-4 cursor-pointer" />
              Riflessivo / انعكاسي
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-navy">
              <input type="checkbox" checked={verbData.irregular} onChange={e => set('irregular', e.target.checked)} className="accent-brand-red w-4 h-4 cursor-pointer" />
              Irregolare / شاذ
            </label>
          </div>

          {/* Conjugation Notes */}
          <div>
            <FieldLabel>Note di Coniugazione / ملاحظات التصريف</FieldLabel>
            <textarea value={verbData.conjugationNotes} onChange={e => set('conjugationNotes', e.target.value)} rows={2} placeholder="Osservazioni sul verbo..." className={textareaCls(false)} />
          </div>

          {/* Verb Examples */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel>Esempi del Verbo</FieldLabel>
              <button type="button" onClick={addEx} className="text-[11px] text-brand-green font-bold flex items-center gap-1 hover:text-[#097b46] cursor-pointer">
                <FiPlus size={12} /> Aggiungi
              </button>
            </div>
            {verbData.examples.map((ex, idx) => (
              <div key={idx} className="flex gap-2 items-start group">
                <span className="mt-2.5 text-[10px] font-bold text-brand-navy/40 w-4 shrink-0">{idx + 1}.</span>
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <input value={ex.it} onChange={e => setEx(idx, 'it', e.target.value)} placeholder="🇮🇹 Frase..." className={inputCls(false)} />
                  <input value={ex.ar} onChange={e => setEx(idx, 'ar', e.target.value)} placeholder="🇪🇬 الترجمة..." className={inputCls(false)} dir="rtl" />
                </div>
                {verbData.examples.length > 1 && (
                  <button type="button" onClick={() => rmEx(idx)} className="mt-2.5 text-brand-navy/30 hover:text-brand-red transition-colors cursor-pointer opacity-0 group-hover:opacity-100" aria-label="Rimuovi">
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const VocabularyFormModal = ({ isOpen, onClose, onSave, initial }) => {
  const isEditing = Boolean(initial?.id);

  const [form,   setForm]   = useState(() => itemToForm(initial));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(itemToForm(initial));
      setErrors({});
      setApiErr('');
    }
  }, [isOpen, initial]);

  const set = useCallback((key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.italianWord.trim())       e.italianWord       = 'La parola italiana è obbligatoria.';
    if (!form.arabicTranslation.trim()) e.arabicTranslation = 'الترجمة العربية مطلوبة.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiErr('');

    const payload = {
      ...(isEditing ? { id: initial.id } : {}),
      italianWord:       form.italianWord.trim(),
      arabicTranslation: form.arabicTranslation.trim(),
      pronunciation:     form.pronunciation.trim(),
      partOfSpeech:      form.partOfSpeech,
      example:           form.example.trim(),
      arabicExample:     form.arabicExample.trim(),
      notes:             form.notes.trim(),
      favorite:          form.favorite,
      source:            isEditing ? (initial.source ?? 'manual') : 'manual',
      ...(form.partOfSpeech === 'Verbo' ? { verbData: form.verbData } : {}),
    };

    const result = await onSave(payload);
    setSaving(false);

    if (result?.ok === false) {
      setApiErr(result.error || 'Errore durante il salvataggio.');
    } else {
      onClose();
    }
  };

  const isVerb = form.partOfSpeech === 'Verbo';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? '✏️ Modifica Parola' : '➕ Aggiungi Parola al Vocabolario'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {apiErr && (
          <div className="flex items-start gap-2 px-4 py-3 bg-brand-red/8 border border-brand-red/20 rounded-xl text-xs text-brand-red font-medium">
            <FiInfo size={14} className="shrink-0 mt-0.5" /> {apiErr}
          </div>
        )}

        {/* Row 1: Italian word + Pronunciation */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Parola Italiana 🇮🇹</FieldLabel>
            <input value={form.italianWord} onChange={e => set('italianWord', e.target.value)} placeholder="es. Buongiorno" className={inputCls(errors.italianWord)} />
            <FieldError msg={errors.italianWord} />
          </div>
          <div>
            <FieldLabel>Pronuncia / النطق</FieldLabel>
            <input value={form.pronunciation} onChange={e => set('pronunciation', e.target.value)} placeholder="es. بون-جور-نو" className={inputCls(false)} dir="rtl" />
          </div>
        </div>

        {/* Row 2: Arabic translation + Part of Speech */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>الترجمة بالعربية 🇪🇬 *</FieldLabel>
            <input value={form.arabicTranslation} onChange={e => set('arabicTranslation', e.target.value)} placeholder="مثال: صباح الخير" className={inputCls(errors.arabicTranslation)} dir="rtl" />
            <FieldError msg={errors.arabicTranslation} />
          </div>
          <div>
            <FieldLabel>Parte del Discorso</FieldLabel>
            <select value={form.partOfSpeech} onChange={e => set('partOfSpeech', e.target.value)} className={selectCls()}>
              {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: Example sentence */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Frase di Esempio 🇮🇹</FieldLabel>
            <textarea value={form.example} onChange={e => set('example', e.target.value)} rows={2} placeholder="Usa la parola in una frase..." className={textareaCls(false)} />
          </div>
          <div>
            <FieldLabel>مثال بالعربية 🇪🇬</FieldLabel>
            <textarea value={form.arabicExample} onChange={e => set('arabicExample', e.target.value)} rows={2} placeholder="ترجمة الجملة..." className={textareaCls(false)} dir="rtl" />
          </div>
        </div>

        {/* Row 4: Notes */}
        <div>
          <FieldLabel>Note / ملاحظات (opzionale)</FieldLabel>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Osservazioni, contesto d'uso..." className={textareaCls(false)} />
        </div>

        {/* Verb conjugation block — only when POS = Verbo */}
        {isVerb && (
          <VerbSection
            verbData={form.verbData}
            onChange={verbData => setForm(prev => ({ ...prev, verbData }))}
          />
        )}

        {/* Favorite toggle */}
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <div
            className={[
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
              form.favorite ? 'bg-amber-400 border-amber-400' : 'border-brand-navy/20 group-hover:border-amber-400',
            ].join(' ')}
            onClick={() => set('favorite', !form.favorite)}
          >
            {form.favorite && <FiStar size={11} className="text-white fill-white" />}
          </div>
          <span className="text-sm font-medium text-brand-navy">Aggiungi ai preferiti ⭐</span>
        </label>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>Annulla</Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            {isEditing ? 'Aggiorna Parola' : 'Salva Parola'}
          </Button>
        </div>

      </form>
    </Dialog>
  );
};

export default VocabularyFormModal;
