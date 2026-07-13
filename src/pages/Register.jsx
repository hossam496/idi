import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await signup(data.name, data.email, data.password);
      navigate('/home');
    } catch (err) {
      setApiError(err.message || 'Errore durante la creazione dell\'account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-brand-cream font-sans">
      
      {/* Background architectural graphics */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[60%] border-4 border-brand-green/5 rounded-t-full pointer-events-none transform -rotate-12" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[70%] border-4 border-brand-navy/5 rounded-t-full pointer-events-none transform rotate-12" />

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

        {/* Register Card */}
        <Card className="rounded-3xl p-8 border-brand-border/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {apiError && (
              <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl text-xs font-medium text-center">
                {apiError}
              </div>
            )}

            <Input
              id="name"
              label="Nome Completo / الاسم الكامل"
              placeholder="es. Giovanni Rossi"
              error={errors.name}
              {...register('name', {
                required: 'Il nome completo è obbligatorio'
              })}
            />

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

            <Input
              id="password"
              type="password"
              label="Password / كلمة المرور"
              placeholder="Minimo 6 caratteri"
              error={errors.password}
              {...register('password', {
                required: 'La password è obbligatoria',
                minLength: {
                  value: 6,
                  message: 'La password deve avere almeno 6 caratteri'
                }
              })}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Conferma Password / تأكيد كلمة المرور"
              placeholder="Ripeti la password"
              error={errors.confirmPassword}
              {...register('confirmPassword', {
                required: 'Confermare la password è obbligatorio',
                validate: value => value === passwordVal || 'Le password non coincidono'
              })}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-2 justify-center text-sm font-semibold tracking-wide"
              isLoading={isLoading}
            >
              Crea Account / إنشاء حساب
            </Button>
          </form>

        </Card>

        {/* Footer Link */}
        <p className="text-center mt-6 text-xs text-brand-textSecondary font-medium">
          Hai già un account?{' '}
          <Link to="/" className="text-brand-green font-bold hover:underline">
            Accedi / تسجيل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
