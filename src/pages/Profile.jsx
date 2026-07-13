import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Dialog from '../components/common/Dialog';
import Input from '../components/common/Input';
import { FiAward, FiEdit2, FiActivity, FiBookOpen, FiBookmark, FiCalendar, FiCheckCircle, FiLock } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { stats, grammarList, vocabularyList } = useLearning();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    }
  });

  const onEditSubmit = async (data) => {
    try {
      await updateProfile(data);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditOpen(false);
      }, 1000);
    } catch (err) {
      alert("Errore durante il salvataggio.");
    }
  };

  const hasCertificate = stats.wordsLearnedCount >= 3 && stats.grammarLearnedCount >= 2;

  return (
    <div className="bg-brand-cream min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        
        {/* Profile Card & Info banner */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Student Overview */}
          <Card className="lg:col-span-4 p-8 text-center flex flex-col items-center space-y-5 rounded-3xl border-brand-border">
            <div className="w-24 h-24 rounded-full bg-brand-navy text-white text-3xl font-serif font-bold flex items-center justify-center border-4 border-brand-green/20 relative">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'ST'}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-brand-green text-white border-2 border-brand-surface flex items-center justify-center text-[10px]" title="Attivo">✓</div>
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold text-brand-navy">{user?.name || 'Studente'}</h2>
              <p className="text-xs text-brand-textSecondary">{user?.email}</p>
              <Badge variant="green" size="sm" className="mt-2">Livello A2 • Intermedio Iniziale</Badge>
            </div>

            <p className="text-xs text-brand-textSecondary/80 italic font-sans max-w-xs leading-relaxed">
              "L'apprendimento non si ferma mai. Continua a conversare con il tutor IA per sbloccare nuovi traguardi."
            </p>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditOpen(true)}
              className="space-x-2 py-2"
            >
              <FiEdit2 size={12} />
              <span>Modifica Profilo</span>
            </Button>
          </Card>

          {/* Stats & Performance Summary */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-5 text-center flex flex-col justify-center items-center space-y-2 rounded-2xl">
                <FiBookmark className="text-brand-green" size={24} />
                <span className="text-2xl font-serif font-bold text-brand-navy">{stats.wordsLearnedCount}</span>
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary tracking-wider">Vocaboli</span>
              </Card>

              <Card className="p-5 text-center flex flex-col justify-center items-center space-y-2 rounded-2xl">
                <FiBookOpen className="text-brand-green" size={24} />
                <span className="text-2xl font-serif font-bold text-brand-navy">{stats.grammarLearnedCount}</span>
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary tracking-wider">Regole</span>
              </Card>

              <Card className="p-5 text-center flex flex-col justify-center items-center space-y-2 rounded-2xl">
                <FiActivity className="text-brand-green" size={24} />
                <span className="text-2xl font-serif font-bold text-brand-navy">{stats.conversationsCount}</span>
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary tracking-wider">Conversazioni</span>
              </Card>

              <Card className="p-5 text-center flex flex-col justify-center items-center space-y-2 rounded-2xl">
                <FiCalendar className="text-brand-green" size={24} />
                <span className="text-2xl font-serif font-bold text-brand-navy">{stats.learningDays}</span>
                <span className="text-[10px] uppercase font-bold text-brand-textSecondary tracking-wider">Giorni di Studio</span>
              </Card>
            </div>

            {/* Achievements/Badges */}
            <Card className="p-6 rounded-3xl">
              <h3 className="font-serif text-lg font-bold text-brand-navy mb-4">Traguardi Raggiunti</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {stats.achievements.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`flex items-start space-x-3.5 p-3.5 border rounded-2xl transition-all ${
                      badge.unlocked 
                        ? 'bg-brand-surface border-brand-border text-brand-navy' 
                        : 'bg-brand-cream/10 border-brand-border/40 text-brand-navy/40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-full shrink-0 ${
                      badge.unlocked ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-navy/5 text-brand-navy/35'
                    }`}>
                      {badge.unlocked ? <FiAward size={20} /> : <FiLock size={20} />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider">{badge.title}</h4>
                      <p className="text-[11px] text-brand-textSecondary leading-normal">{badge.desc}</p>
                      {badge.unlocked && badge.date && (
                        <span className="text-[9px] text-brand-green font-bold block pt-1">Sbloccato il {badge.date}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>

        {/* Certificates Placeholder */}
        <section className="space-y-4 pt-4">
          <h3 className="font-serif text-xl font-bold text-brand-navy">Attestati e Certificazioni</h3>
          
          {!hasCertificate ? (
            <Card className="p-8 text-center border-dashed border-2 border-brand-border max-w-2xl mx-auto rounded-3xl space-y-4">
              <FiAward className="text-brand-navy/35 mx-auto" size={32} />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Nessun certificato disponibile</h4>
                <p className="text-xs text-brand-textSecondary max-w-md mx-auto">
                  Per sbloccare il tuo primo Certificato di Frequenza, devi aggiungere almeno 3 vocaboli e 2 regole grammaticali al tuo profilo (clicca su "Carica Dati Demo" nelle rispettive pagine se vuoi sbloccarlo immediatamente!).
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden border-brand-border rounded-3xl shadow-premium max-w-3xl mx-auto">
              {/* Premium Classical Roman Arch-styled border Certificate mockup */}
              <div className="p-8 md:p-12 bg-white relative flex flex-col justify-between h-[450px] border-[12px] border-brand-cream select-none text-center">
                
                {/* Golden corner flourishes */}
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500" />

                {/* Certificate Header */}
                <div className="space-y-2">
                  <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#0B8F52]">Istituto Di Italiano • IDI</span>
                  <h2 className="font-serif text-3xl font-bold text-brand-navy tracking-tight mt-1">ATTESTATO DI FREQUENZA</h2>
                  <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-2" />
                </div>

                {/* Student Award text */}
                <div className="space-y-4 py-6">
                  <p className="text-xs text-brand-textSecondary uppercase tracking-widest">Si certifica che lo studente</p>
                  <p className="font-serif text-2xl font-bold text-brand-navy italic border-b border-brand-border max-w-md mx-auto pb-1">
                    {user?.name || 'Giovanni Rossi'}
                  </p>
                  <p className="text-xs text-brand-textSecondary leading-relaxed max-w-lg mx-auto">
                    ha completato con successo le prime sessioni di conversazione in lingua italiana e ha arricchito il proprio vocabolario e la conoscenza della grammatica con il supporto del Tutor IA di Istituto Di Italiano.
                  </p>
                </div>

                {/* Certificate Footer signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-brand-border/60 max-w-xl mx-auto w-full">
                  <div className="text-center">
                    <p className="font-serif text-sm italic font-bold text-brand-navy">Tutor IA - Sofia</p>
                    <p className="text-[9px] uppercase tracking-wider text-brand-textSecondary/60 mt-1">Direttrice Didattica IA</p>
                  </div>
                  <div className="text-center flex flex-col items-center justify-end">
                    {/* SVG Seal */}
                    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="mb-1">
                      <circle cx="20" cy="20" r="18" fill="#FAF8F5" stroke="#D97706" strokeWidth="2" strokeDasharray="3 2" />
                      <circle cx="20" cy="20" r="14" fill="#FBBF24" />
                      <path d="M15 15L25 25M25 15L15 25" stroke="#D97706" strokeWidth="1.5" />
                    </svg>
                    <p className="text-[9px] uppercase tracking-wider text-brand-textSecondary/60">Sigillo dell'Istituto</p>
                  </div>
                </div>

              </div>

              {/* Download Action banner */}
              <div className="bg-brand-navy px-6 py-3 flex items-center justify-between text-white">
                <span className="text-xs font-semibold">Certificato Livello A2 sbloccato!</span>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => alert("Funzionalità di download PDF (UI Soltanto)")}
                >
                  Scarica PDF
                </Button>
              </div>
            </Card>
          )}
        </section>

      </main>

      {/* Edit Profile Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modifica Dati Profilo"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-5">
          {saveSuccess && (
            <div className="p-3 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-xl text-xs font-medium text-center">
              Profilo aggiornato con successo!
            </div>
          )}

          <Input
            id="profile-name"
            label="Nome Completo / الاسم الكامل"
            placeholder="es. Giovanni Rossi"
            error={errors.name}
            {...register('name', { required: 'Il nome è obbligatorio' })}
          />

          <Input
            id="profile-email"
            label="Indirizzo Email / البريد الإلكتروني"
            placeholder="nome@esempio.com"
            error={errors.email}
            {...register('email', { 
              required: 'L\'email è obbligatoria',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email non valida'
              }
            })}
          />

          <div className="roman-divider my-4"></div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" variant="primary">
              Salva Modifiche
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Profile;
