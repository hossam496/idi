import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiInfo } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate('/home');
    } catch (err) {
      setApiError(err.message || 'Credenziali non valide.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-brand-cream font-sans">
      
      {/* Decorative elegant background arches */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[60%] border-4 border-brand-green/5 rounded-t-full pointer-events-none transform rotate-12" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] border-4 border-brand-navy/5 rounded-t-full pointer-events-none transform -rotate-12" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.jpg"
            alt="IDI Logo"
            className="w-32 md:w-36 mx-auto rounded-xl shadow-lg mb-4"
          />
          <h1 className="font-serif text-3xl font-bold tracking-tight text-brand-navy">
            IDI - Istituto di Italiano
          </h1>
          <p className="text-sm text-brand-green font-semibold tracking-widest uppercase mt-1">
            Learn Italian with AI
          </p>
          <div className="flex flex-col items-center mt-2 space-y-0.5">
            <span className="text-[11px] text-brand-textSecondary/60 text-right dir-rtl font-sans">
              تعلم اللغة الإيطالية مع مدرس ذكي
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="rounded-3xl p-8 border-brand-border/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {apiError && (
              <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl text-xs font-medium text-center">
                {apiError}
              </div>
            )}

            <Input
              id="email"
              label="Indirizzo Email / البريد الإلكتروني"
              placeholder="es. nome@esempio.com"
              error={errors.email}
              {...register('email', {
                required: 'L\'email è obbligatoria',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Indirizzo email non valido'
                }
              })}
            />

            <div className="space-y-1">
              <Input
                id="password"
                type="password"
                label="Password / كلمة المرور"
                placeholder="Inserisci la password"
                error={errors.password}
                {...register('password', {
                  required: 'La password è obbligatoria',
                  minLength: {
                    value: 6,
                    message: 'La password deve avere almeno 6 caratteri'
                  }
                })}
              />
              <div className="flex justify-between items-center pt-1 text-xs">
                <label className="flex items-center space-x-2 text-brand-navy/70 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-brand-border text-brand-green focus:ring-brand-green/30 accent-brand-green" 
                  />
                  <span>Ricordami / تذكرني</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert("Un link per reimpostare la password è stato inviato alla tua email demo."); }}
                  className="text-brand-green hover:underline font-semibold"
                >
                  Password dimenticata? / نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 justify-center text-sm font-semibold tracking-wide"
              isLoading={isLoading}
            >
              Accedi / تسجيل الدخول
            </Button>
          </form>

        </Card>

        {/* Footer Link */}
        <p className="text-center mt-6 text-xs text-brand-textSecondary font-medium">
          Non sei ancora iscritto?{' '}
          <Link to="/register" className="text-brand-green font-bold hover:underline">
            Registrati ora / سجّل الآن
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
