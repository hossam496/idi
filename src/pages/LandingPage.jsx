import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Badge from '../components/common/Badge';
import { FiArrowRight, FiCheckCircle, FiChevronDown, FiChevronUp, FiBook, FiCpu, FiMessageSquare, FiActivity, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('food');
  const [openFaq, setOpenFaq] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm();

  const handleContactSubmit = (data) => {
    // Simulate contact form submission
    console.log("Contact form submitted:", data);
    alert("Grazie per averci contattato! Ti risponderemo al più presto. / شكراً لتواصلك معنا! سنرد عليك في أقرب وقت.");
    reset();
  };

  const tabs = {
    history: {
      title: 'Storia 🏛',
      it: 'Dai fasti del Colosseo e dell\'Impero Romano alla culla del Rinascimento a Firenze. L\'Italia ha plasmato la civiltà occidentale.',
      ar: 'من أمجاد الكولوسيوم والإمبراطورية الرومانية إلى مهد عصر النهضة في فلورنسا. لقد شكلت إيطاليا معالم الحضارة الغربية.',
      bg: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
    },
    culture: {
      title: 'Cultura 🎨',
      it: 'La patria di Leonardo da Vinci, Michelangelo, dell\'opera lirica e di una letteratura immortale che risuona da secoli.',
      ar: 'موطن ليوناردو دا فينشي، وميكيلانجيلو، والأوبرا، والأدب الخالد الذي يتردد صداه عبر القرون.',
      bg: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80'
    },
    food: {
      title: 'Cibo 🍕',
      it: 'Non solo pizza e pasta: un viaggio sensoriale tra ingredienti freschi, olio extravergine d\'oliva e tradizioni regionali uniche.',
      ar: 'ليست مجرد بيتزا ومعكرونة: رحلة حسية بين المكونات الطازجة، زيت الزيتون البكر الممتاز، والتقاليد الإقليمية الفريدة.',
      bg: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'
    },
    travel: {
      title: 'Viaggio ⛵',
      it: 'Dalle romantiche gondole di Venezia alle scogliere colorate di Positano. Ogni angolo d\'Italia toglie il fiato.',
      ar: 'من قوارب الجندول الرومانسية في البندقية إلى المنحدرات الملونة في بوزيتانو. كل زاوية في إيطاليا تحبس الأنفاس.',
      bg: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=800&q=80'
    },
    lifestyle: {
      title: 'Stile di Vita ☕',
      it: 'L\'arte della "Dolce Vita". Godersi il tempo lento, sorseggiare un caffè espresso in piazza e vivere con eleganza e passione.',
      ar: 'فن "الحياة الحلوة" (La Dolce Vita). الاستمتاع بالوقت ببطء، رشف قهوة الإسبريسو في الساحة والعيش بأناقة وشغف.',
      bg: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80'
    }
  };

  const faqs = [
    {
      qIt: 'Come funziona l\'apprendimento assistito dall\'Intelligenza Artificiale?',
      qAr: 'كيف يعمل التعلم المدعوم بالذكاء الاصطناعي؟',
      aIt: 'Il nostro Tutor IA simula conversazioni reali adattandosi al tuo livello. Corregge i tuoi errori in tempo reale ed estrae automaticamente regole grammaticali e nuovi vocaboli direttamente dalla chat per salvarli nel tuo profilo.',
      aAr: 'يقوم معلم الذكاء الاصطناعي الخاص بنا بمحاكاة محادثات حقيقية تتكيف مع مستواك. يقوم بتصحيح أخطائك في الوقت الفعلي ويستخرج تلقائياً القواعد النحوية والمفردات الجديدة مباشرة من المحادثة لحفظها في ملفك الشخصي.'
    },
    {
      qIt: 'Questo corso è adatto a principianti assoluti?',
      qAr: 'هل هذا الكورس مناسب للمبتدئين تماماً؟',
      aIt: 'Assolutamente sì. Il tutor IA supporta traduzioni istantanee in arabo e fornisce spiegazioni bilingue. Puoi chattare inserendo risposte miste e progredire al tuo ritmo.',
      aAr: 'بالتأكيد نعم. يدعم معلم الذكاء الاصطناعي الترجمة الفورية إلى اللغة العربية ويقدم تفسيرات ثنائية اللغة. يمكنك الدردشة بإدخال إجابات مختلطة والتقدم بالسرعة التي تناسبك.'
    },
    {
      qIt: 'Posso esportare le mie schede di grammatica e vocabolario?',
      qAr: 'هل يمكنني تصدير بطاقات القواعد والمفردات الخاصة بي؟',
      aIt: 'Sì, nella futura release del backend sarà possibile esportare il proprio glossario personalizzato in PDF ed esercitarsi con flashcard offline.',
      aAr: 'نعم، في إصدار الخلفية البرمجية المستقبلي، سيكون من الممكن تصدير مسرد المصطلحات المخصص الخاص بك إلى ملف PDF والتدرب باستخدام بطاقات استذكار بدون إنترنت.'
    }
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-brand-cream min-h-screen text-brand-textPrimary font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-28 overflow-hidden max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            <Badge variant="green" className="self-start px-4 py-1.5 text-xs tracking-wider">
              🇮🇹 Istituto Di Italiano • IDI
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-brand-navy">
              Parla l'Italiano con fiducia, guidato dall'<span className="text-brand-green">Intelligenza Artificiale</span>
            </h1>
            
            <div className="border-l-4 border-brand-green/30 pl-4 py-1">
              <p className="text-lg text-brand-textSecondary">
                Impara la lingua più bella del mondo attraverso conversazioni naturali, spiegazioni in arabo e un percorso totalmente personalizzato.
              </p>
              <p className="text-sm text-brand-textSecondary/70 mt-1 dir-rtl text-right font-sans">
                تعلم أجمل لغة في العالم من خلال المحادثات الطبيعية، والشروحات باللغة العربية، ومسار تعليمي مخصص بالكامل لك.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/chat')}
                className="group space-x-2 py-4 justify-center"
              >
                <span>Inizia a Chattare Ora</span>
                <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const element = document.getElementById('method');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-4 justify-center"
              >
                Scopri il Metodo
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Column / Elegant Classical Roman Arch illustration box */}
            <div className="relative w-full max-w-[380px] h-[480px] bg-brand-surface border border-brand-border rounded-t-arch shadow-premium overflow-hidden p-6 flex flex-col justify-between">
              
              {/* Outer Arch Frame design */}
              <div className="absolute inset-4 border-2 border-dashed border-brand-navy/15 rounded-t-arch pointer-events-none" />
              
              <div className="text-center pt-8 z-10">
                <span className="font-serif italic text-brand-navy/40 text-sm block">Benvenuto all'Istituto</span>
                <h3 className="font-serif text-2xl font-bold text-brand-navy mt-1">Istituto Di Italiano</h3>
                <div className="w-12 h-1 bg-brand-green mx-auto mt-3 rounded" />
              </div>

              {/* Logo illustration */}
              <div className="flex-1 flex items-center justify-center relative my-4">
                <div className="absolute w-48 h-48 rounded-full bg-brand-cream flex items-center justify-center opacity-60" />
                <img
                  src="/logo.jpg"
                  alt="IDI Logo"
                  className="w-36 h-36 object-cover rounded-2xl shadow-lg z-10 border border-brand-border"
                />
              </div>

              <div className="bg-brand-navy text-white rounded-2xl p-4 text-center z-10 shadow-soft">
                <p className="text-xs font-serif italic text-brand-green">"Impara l'Italiano con l'IA"</p>
                <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest mt-1">IDI SMART TUTOR</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Why Learn Italian */}
      <motion.section 
        {...fadeUp}
        className="py-20 bg-brand-surface border-y border-brand-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
              Perché Imparare l'Italiano? 🇮🇹
            </h2>
            <div className="h-1 w-16 bg-brand-green mx-auto rounded" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Italian Card */}
            <Card className="text-left border-l-4 border-l-brand-green flex flex-col justify-between p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-brand-navy">L'Italiano per te</h3>
              <p className="text-sm text-brand-textSecondary leading-relaxed">
                L'italiano è la chiave per comprendere a fondo il patrimonio artistico, musicale, letterario e culinario d'Europa. Parlare l'italiano ti permette di connetterti autenticamente con le persone, fare carriera nel turismo e nel design di lusso, e arricchire il tuo bagaglio culturale personale.
              </p>
              <Badge variant="green" className="self-start text-[10px]">Cultura e Carriera</Badge>
            </Card>

            {/* Arabic Card */}
            <Card className="text-right border-r-4 border-r-brand-red flex flex-col justify-between p-8 space-y-4 dir-rtl">
              <h3 className="font-sans text-xl font-bold text-brand-navy">اللغة الإيطالية من أجلك</h3>
              <p className="text-sm text-brand-textSecondary leading-relaxed font-sans">
                تعتبر اللغة الإيطالية المفتاح لفهم التراث الفني والموسيقي والأدبي ومطبخ أوروبا بعمق. يتيح لك التحدث بالإيطالية التواصل بشكل أصيل مع الناس، وبناء حياة مهنية في مجالات السياحة وتصميم الأزياء الفاخرة، وإثراء حصيلتك الثقافية الشخصية.
              </p>
              <Badge variant="red" className="self-end text-[10px]">الثقافة والعمل</Badge>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Discover Italy */}
      <motion.section 
        {...fadeUp}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
            Scopri l'Italia 🏛
          </h2>
          <p className="text-brand-textSecondary text-sm max-w-xl mx-auto">
            Impara la lingua immergendoti nella storia, nella bellezza e nello stile di vita italiano.
          </p>
          <div className="h-1 w-16 bg-brand-green mx-auto rounded" />
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.keys(tabs).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tabKey
                  ? 'bg-brand-navy text-white shadow'
                  : 'bg-brand-surface text-brand-navy border border-brand-border hover:bg-brand-navy/5'
              }`}
            >
              {tabs[tabKey].title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="max-w-4xl mx-auto overflow-hidden p-0 rounded-3xl border-brand-border shadow-premium">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-brand-navy">
                  {tabs[activeTab].title}
                </h3>
                <p className="text-sm text-brand-textSecondary leading-relaxed">
                  {tabs[activeTab].it}
                </p>
              </div>
              
              <div className="border-t border-brand-border pt-4 text-right dir-rtl">
                <p className="text-sm text-brand-textSecondary/80 leading-relaxed font-sans">
                  {tabs[activeTab].ar}
                </p>
              </div>
            </div>
            
            <div className="h-64 md:h-auto min-h-[300px] relative">
              <img 
                src={tabs[activeTab].bg} 
                alt={tabs[activeTab].title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-surface md:from-brand-surface/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Our Teaching Method */}
      <motion.section 
        {...fadeUp}
        id="method"
        className="py-20 bg-brand-surface border-y border-brand-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
              Il Nostro Metodo Didattico 🎓
            </h2>
            <div className="h-1 w-16 bg-brand-green mx-auto rounded" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="flex flex-col space-y-4 items-start p-8">
              <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl">
                <FiMessageSquare size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">Conversazione Attiva</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                Niente esercizi noiosi a crocette. Impari rispondendo e chiacchierando col Tutor IA su argomenti della vita quotidiana in Italia.
              </p>
              <p className="text-[11px] text-brand-textSecondary/65 dir-rtl text-right w-full pt-2 border-t border-brand-border/60">
                لا توجد تمارين مملة للاختيار من متعدد. تتعلم من خلال الإجابة والدردشة مع معلم الذكاء الاصطناعي حول مواضيع الحياة اليومية في إيطاليا.
              </p>
            </Card>

            <Card className="flex flex-col space-y-4 items-start p-8">
              <div className="p-3 bg-brand-navy/5 text-brand-navy rounded-2xl">
                <FiCpu size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">Analisi Grammaticale IA</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                Il sistema analizza i messaggi che invii ed estrae automaticamente i concetti grammaticali rilevanti per spiegarteli chiaramente.
              </p>
              <p className="text-[11px] text-brand-textSecondary/65 dir-rtl text-right w-full pt-2 border-t border-brand-border/60">
                يقوم النظام بتحليل الرسائل التي ترسلها ويستخرج تلقائياً المفاهيم النحوية ذات الصلة لشرحها لك بوضوح.
              </p>
            </Card>

            <Card className="flex flex-col space-y-4 items-start p-8">
              <div className="p-3 bg-brand-red/10 text-brand-red rounded-2xl">
                <FiBook size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">Dizionario Dinamico</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                Salva istantaneamente i vocaboli nuovi incontrati in chat con la loro trascrizione fonetica e traduzione in lingua araba.
              </p>
              <p className="text-[11px] text-brand-textSecondary/65 dir-rtl text-right w-full pt-2 border-t border-brand-border/60">
                احفظ فوراً المفردات الجديدة التي تصادفها في الدردشة مع كتابتها الصوتية وترجمتها إلى اللغة العربية.
              </p>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Learn with AI Tutor */}
      <motion.section 
        {...fadeUp}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="green" className="px-3 py-1">TUTOR INTELLIGENTE 🤖</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
              Un assistente personale disponibile 24 ore su 24
            </h2>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Il Tutor IA dell'Istituto IDI ascolta, comprende e risponde adattandosi alla tua velocità di apprendimento. Parla in italiano ma ti risponde con traduzioni e note in arabo quando ne hai più bisogno.
            </p>
            <div className="border-r-4 border-brand-red pr-4 py-1 text-right dir-rtl">
              <p className="text-xs text-brand-textSecondary/85 leading-relaxed font-sans">
                مساعد شخصي متاح على مدار 24 ساعة طوال أيام الأسبوع. يستمع معلم الذكاء الاصطناعي في معهد IDI ويفهم ويجيب بالتكيف مع سرعة تعلمك. يتحدث بالإيطالية ولكنه يجيبك بالترجمات والملاحظات باللغة العربية عندما تكون في أمس الحاجة إليها.
              </p>
            </div>
            
            <ul className="space-y-3 pt-2">
              <li className="flex items-center space-x-2 text-sm text-brand-navy font-semibold">
                <FiCheckCircle className="text-brand-green" />
                <span>Nessun giudizio, impara dai tuoi errori con serenità</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-brand-navy font-semibold">
                <FiCheckCircle className="text-brand-green" />
                <span>Supporto bilingue completo (Italiano + Arabo)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-premium relative">
            {/* Visual Chat mockup snippet */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-brand-border">
                <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-serif font-bold text-sm">
                  IA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">IDI AI Tutor</h4>
                  <span className="text-[10px] text-brand-green flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block mr-1 animate-pulse"></span>
                    Attivo ora
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 py-2">
                <div className="max-w-[85%] bg-brand-cream/60 rounded-2xl p-4 text-xs">
                  <p className="font-semibold text-brand-navy">Tutor:</p>
                  <p className="mt-1">Ciao! Come stai? Oggi pratichiamo i saluti. Prova a dire "Buon pomeriggio!"</p>
                  <p className="mt-2 text-brand-textSecondary/70 italic text-[10px] dir-rtl text-right">
                    مرحباً! كيف حالك؟ اليوم نتدرب على التحيات. جرب أن تقول "Buon pomeriggio!" (مساء الخير)
                  </p>
                </div>
                
                <div className="max-w-[80%] bg-brand-navy text-white rounded-2xl p-4 text-xs ml-auto">
                  <p className="font-semibold text-white/80">Studente:</p>
                  <p className="mt-1">Buon pomeriggio! Io sto bene, e tu?</p>
                </div>

                <div className="max-w-[85%] bg-brand-cream/60 rounded-2xl p-4 text-xs">
                  <p className="font-semibold text-brand-navy">Tutor:</p>
                  <p className="mt-1">Molto bene, grazie! Hai fatto un ottimo lavoro. 🎉</p>
                  <p className="mt-1 text-[10px] text-brand-green font-bold">💡 Estratto vocabolo: "Ottimo" (ممتاز)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grammar & Vocabulary Section */}
      <motion.section 
        {...fadeUp}
        className="py-20 bg-brand-surface border-y border-brand-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <Card className="p-6 bg-brand-cream/30 space-y-3">
              <Badge variant="green" size="sm">Grammatica</Badge>
              <h4 className="font-serif text-base font-bold text-brand-navy">Schede di Studio</h4>
              <p className="text-[11px] text-brand-textSecondary leading-relaxed">
                Le regole complesse vengono sintetizzate in schede chiare con spiegazioni bilingue ed esempi pratici pronti per essere memorizzati.
              </p>
            </Card>
            
            <Card className="p-6 bg-brand-cream/30 space-y-3">
              <Badge variant="red" size="sm">Vocabolario</Badge>
              <h4 className="font-serif text-base font-bold text-brand-navy">Glossario Personale</h4>
              <p className="text-[11px] text-brand-textSecondary leading-relaxed">
                Tutte le parole nuove scoperte vengono archiviate insieme alla corretta trascrizione fonetica e pronuncia.
              </p>
            </Card>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <Badge variant="navy" className="px-3 py-1">ARCHIVIO CONOSCENZA 📚</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
              Tieni traccia di ogni regola e vocabolo salvato
            </h2>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Man mano che conversi con il tutor, la tua libreria personale si riempie. Puoi ricercare termini, filtrare per difficoltà ed evidenziare i tuoi elementi preferiti per ripassarli in qualsiasi momento.
            </p>
            <div className="border-l-4 border-brand-green/30 pl-4 py-1">
              <p className="text-xs text-brand-textSecondary/80 leading-relaxed font-sans">
                بينما تتحدث مع المعلم، تمتلئ مكتبتك الشخصية بالمعلومات. يمكنك البحث عن المصطلحات، وتصفيتها حسب الصعوبة، وتحديد عناصرك المفضلة لمراجعتها في أي وقت.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Real Conversation Practice Statistics */}
      <motion.section 
        {...fadeUp}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <Badge variant="navy" className="px-3 py-1">ANALISI DI APPRENDIMENTO 💬</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
            Misura i tuoi progressi di conversazione
          </h2>
          <p className="text-sm text-brand-textSecondary">
            Visualizza in tempo reale le statistiche del tuo profilo e segui l'espansione del tuo vocabolario.
          </p>
          <div className="h-1 w-16 bg-brand-green mx-auto rounded" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center space-y-2">
            <FiActivity className="text-brand-green mx-auto" size={28} />
            <h4 className="text-2xl font-bold text-brand-navy font-serif">100%</h4>
            <p className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">Pratica Attiva</p>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <FiMessageSquare className="text-brand-green mx-auto" size={28} />
            <h4 className="text-2xl font-bold text-brand-navy font-serif">24/7</h4>
            <p className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">Tutor Disponibile</p>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <FiBook className="text-brand-green mx-auto" size={28} />
            <h4 className="text-2xl font-bold text-brand-navy font-serif">+500</h4>
            <p className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">Vocaboli nel DB</p>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <FiCheckCircle className="text-brand-green mx-auto" size={28} />
            <h4 className="text-2xl font-bold text-brand-navy font-serif">A1-B2</h4>
            <p className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">Livelli supportati</p>
          </Card>
        </div>
      </motion.section>

      {/* Student Reviews */}
      <motion.section 
        {...fadeUp}
        className="py-20 bg-brand-surface border-y border-brand-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
              Cosa dicono i nostri studenti ⭐
            </h2>
            <div className="h-1 w-16 bg-brand-green mx-auto rounded" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4 flex flex-col justify-between">
              <p className="text-xs text-brand-textSecondary leading-relaxed italic">
                "Il tutor IA è fantastico. Posso chattare liberamente la sera senza timore di essere giudicata per gli errori. Spiegazioni bilingue eccellenti!"
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-brand-border">
                <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                  FA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Fatima Al-Harbi</h4>
                  <span className="text-[10px] text-brand-green font-semibold">Studente B1 • Riyadh</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 flex flex-col justify-between">
              <p className="text-xs text-brand-textSecondary leading-relaxed italic">
                "Cercavo un modo per fare pratica di conversazione prima del mio viaggio a Firenze. In sole due settimane ho imparato a fare ordinazioni al ristorante e chiedere indicazioni con disinvoltura."
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-brand-border">
                <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                  KM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Khaled Mansoor</h4>
                  <span className="text-[10px] text-brand-green font-semibold">Studente A2 • Dubai</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 flex flex-col justify-between">
              <p className="text-xs text-brand-textSecondary leading-relaxed italic">
                "Poter salvare istantaneamente i vocaboli estratti dalla chat e ripassarli è utilissimo. Il design è pulito, elegante e molto facile da usare."
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-brand-border">
                <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                  AY
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Amina Yasin</h4>
                  <span className="text-[10px] text-brand-green font-semibold">Studente A1 • Cairo</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* FAQ Accordion */}
      <motion.section 
        {...fadeUp}
        className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy">
            Domande Frequenti ❓
          </h2>
          <div className="h-1 w-16 bg-brand-green mx-auto rounded" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card 
                key={idx} 
                className="p-5 cursor-pointer hover:border-brand-navy/30 transition-all rounded-2xl"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex justify-between items-start space-x-4">
                  <div className="flex-1 space-y-1 text-left">
                    <h4 className="font-serif font-bold text-brand-navy text-sm sm:text-base">
                      {faq.qIt}
                    </h4>
                    <p className="text-xs text-brand-textSecondary/70 font-sans dir-rtl text-right">
                      {faq.qAr}
                    </p>
                  </div>
                  <div className="text-brand-navy/60 pt-1">
                    {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  </div>
                </div>
                
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-brand-border text-left space-y-3 animate-fadeIn">
                    <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
                      {faq.aIt}
                    </p>
                    <p className="text-xs text-brand-textSecondary/80 leading-relaxed font-sans dir-rtl text-right">
                      {faq.aAr}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </motion.section>

      {/* Contact Us */}
      <motion.section 
        {...fadeUp}
        className="py-20 bg-brand-surface border-t border-brand-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6 text-left">
              <h2 className="font-serif text-3xl font-bold text-brand-navy">
                Contattaci 📩
              </h2>
              <p className="text-sm text-brand-textSecondary">
                Hai domande o hai bisogno di supporto tecnico? Il nostro team di Istituto Di Italiano è a tua completa disposizione. Scrivici un messaggio!
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-3 text-brand-navy text-sm font-medium">
                  <FiMapPin className="text-brand-green" size={18} />
                  <span>Via dei Fori Imperiali, Roma, Italia</span>
                </div>
                <div className="flex items-center space-x-3 text-brand-navy text-sm font-medium">
                  <FiPhone className="text-brand-green" size={18} />
                  <span>+39 06 1234567</span>
                </div>
                <div className="flex items-center space-x-3 text-brand-navy text-sm font-medium">
                  <FiMail className="text-brand-green" size={18} />
                  <span>info@idi.it</span>
                </div>
              </div>
            </div>

            <Card className="lg:col-span-7 rounded-3xl p-8 border-brand-border/80 shadow-premium">
              <form onSubmit={handleSubmit(handleContactSubmit)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    id="contact-name"
                    label="Nome / الاسم"
                    placeholder="Il tuo nome"
                    error={errors.name}
                    {...register('name', { required: 'Il nome è obbligatorio' })}
                  />
                  <Input
                    id="contact-email"
                    label="Email / البريد الإلكتروني"
                    placeholder="indirizzo@email.com"
                    error={errors.email}
                    {...register('email', { 
                      required: 'L\'email è obbligatoria',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email non valida'
                      }
                    })}
                  />
                </div>
                
                <Textarea
                  id="contact-message"
                  label="Messaggio / الرسالة"
                  placeholder="Scrivi qui il tuo messaggio..."
                  error={errors.message}
                  {...register('message', { required: 'Il messaggio è obbligatorio' })}
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3 justify-center text-sm font-bold tracking-wide"
                >
                  Invia Messaggio / إرسال الرسالة
                </Button>
              </form>
            </Card>

          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-brand-navy text-white py-12 border-t border-brand-navy/10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 32V20C8 13.3726 13.3726 8 20 8C26.6274 8 32 13.3726 32 20V32" stroke="#0B8F52" strokeWidth="4" strokeLinecap="round" />
                <path d="M14 32V22C14 18.6863 16.6863 16 20 16C23.3137 16 26 18.6863 26 22V32" stroke="#C62828" strokeWidth="3" strokeLinecap="round" />
                <rect x="5" y="32" width="8" height="4" rx="1" fill="#FFFFFF" />
                <rect x="27" y="32" width="8" height="4" rx="1" fill="#FFFFFF" />
                <rect x="11" y="32" width="18" height="4" rx="1" fill="#FFFFFF" />
              </svg>
              <h3 className="font-serif text-lg font-bold">Istituto Di Italiano</h3>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Un ponte culturale e formativo guidato dall'Intelligenza Artificiale, per imparare l'italiano con eleganza e semplicità.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-brand-green">Link Utili</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li><a href="#about" className="hover:text-white transition-colors">Chi Siamo</a></li>
              <li><a href="#courses" className="hover:text-white transition-colors">I Nostri Corsi</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Termini di Servizio</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-brand-green">Tecnologia</h4>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li><span className="opacity-80">AI Conversational Engine</span></li>
              <li><span className="opacity-80">Spiegazioni Bilingue Dinamiche</span></li>
              <li><span className="opacity-80">Modello di Estrazione Grammatica</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-brand-green">Seguici</h4>
            <div className="flex space-x-3">
              <a href="#fb" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-green flex items-center justify-center transition-all cursor-pointer"><FaFacebookF size={14} /></a>
              <a href="#ig" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-green flex items-center justify-center transition-all cursor-pointer"><FaInstagram size={14} /></a>
              <a href="#yt" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-green flex items-center justify-center transition-all cursor-pointer"><FaYoutube size={14} /></a>
              <a href="#tw" className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-green flex items-center justify-center transition-all cursor-pointer"><FaTwitter size={14} /></a>
            </div>
            <p className="text-[10px] text-white/50 pt-2 border-t border-white/10">
              &copy; {new Date().getFullYear()} IDI. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
