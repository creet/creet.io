import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { FormCardProps } from '@/components/form-builder/FormCard';
import { FormCard } from '@/components/form-builder/FormCard';
import { motion } from 'framer-motion';
import AppBar from '@/components/ui/app-bar';
import BackButton from '@/components/ui/back-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AboutYouBlockConfig } from '@/types/form-config';
import { getContrastColor, getPrimaryButtonStyles } from '@/lib/design-tokens';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Allowed image types for avatar upload (supports iPhone HEIC, web images, and standard formats)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AboutYouCardProps extends Omit<FormCardProps, 'config' | 'onFieldFocus'> {
  config: AboutYouBlockConfig;
  onFieldFocus: (blockId: string, fieldPath: string) => void;
}

interface FormState {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  avatar?: string;
}

const AboutYouCard: React.FC<AboutYouCardProps> = ({ config, onFieldFocus, theme, ...props }) => {
  // Get form data context (safe version returns null if not in provider)
  const formDataContext = useFormDataSafe();

  // Form state - initialize from context if available
  const [formState, setFormState] = useState<FormState>(() => ({
    name: formDataContext?.data.aboutYou?.name || '',
    email: formDataContext?.data.aboutYou?.email || '',
    avatarUrl: formDataContext?.data.aboutYou?.avatarUrl || null,
  }));

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFieldClick = (fieldPath: string) => {
    onFieldFocus(config.id, fieldPath);
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Handle field blur (mark as touched)
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Handle avatar image selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Please select a valid image (JPG, PNG, WebP, or HEIC)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    // Create local URL for preview (not uploaded to server)
    const localUrl = URL.createObjectURL(file);
    setFormState(prev => ({ ...prev, avatarUrl: localUrl }));
    setTouched(prev => ({ ...prev, avatar: true }));
  };

  // Trigger file input click
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  // Validation logic
  const validationErrors = useMemo((): ValidationErrors => {
    const errors: ValidationErrors = {};
    const fields = config.props.fields;

    // Name validation
    if (fields.name.enabled && fields.name.required && !formState.name.trim()) {
      errors.name = 'Name is required';
    }

    // Email validation
    if (fields.email.enabled && fields.email.required) {
      if (!formState.email.trim()) {
        errors.email = 'Email is required';
      } else if (!isValidEmail(formState.email)) {
        errors.email = 'Please enter a valid email';
      }
    } else if (formState.email && !isValidEmail(formState.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Avatar validation
    if (fields.avatar.enabled && fields.avatar.required && !formState.avatarUrl) {
      errors.avatar = 'Photo is required';
    }

    return errors;
  }, [formState, config.props.fields]);

  // Check if form is valid
  const isFormValid = Object.keys(validationErrors).length === 0;

  // Handle continue click
  const handleContinue = () => {
    // Mark all fields as touched to show errors
    setTouched({
      name: true,
      email: true,
      avatar: true,
    });

    if (isFormValid) {
      // Store form data in context
      if (formDataContext) {
        formDataContext.setAboutYou({
          name: formState.name,
          email: formState.email,
          avatarUrl: formState.avatarUrl,
        });
      }
      props.onNext();
    }
  };

  return (
    <FormCard {...props} theme={theme}>
      {/* 
        Layout: Centered form with responsive padding
        
        RESPONSIVE STRATEGY:
        - Form Builder (~800-1000px container): Uses base/sm styles
        - Preview/Public (full viewport): lg: breakpoints trigger for larger sizing
        
        Padding scales: px-6 → sm:px-8 → lg:px-12
      */}
      <div className="flex-grow flex flex-col overflow-hidden relative">

        {/* Back Button */}
        {props.onPrevious && <BackButton onClick={props.onPrevious} />}

        {/* 
          AppBar with Logo
          RESPONSIVE PADDING: px-6 → sm:px-8 → lg:px-12
        */}
        <div className="flex-shrink-0">
          <AppBar
            maxWidthClass="max-w-xl cq-lg:max-w-2xl"
            paddingXClass="px-6 sm:px-8 cq-lg:px-12"
            logoUrl={theme?.logoUrl}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto w-full scrollbar-hide">
          <div className="w-full px-6 sm:px-8 cq-lg:px-12 pb-6 cq-lg:pb-10 pt-2 cq-lg:pt-4">
            <div className="mx-auto flex w-full max-w-xl cq-lg:max-w-2xl flex-col items-stretch">

              {/* 
                Header Section
                RESPONSIVE TITLE: text-xl → sm:text-2xl → lg:text-3xl
                RESPONSIVE DESC: text-sm → lg:text-base
                Spacing: mb-6 → lg:mb-8
              */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4 cq-lg:mb-6"
              >
                <h1
                  className="text-xl sm:text-2xl cq-lg:text-3xl font-bold leading-tight tracking-tight text-white mb-2 cq-lg:mb-3"
                  style={{ color: config.props.titleColor, fontFamily: theme?.headingFont }}
                  onClick={() => handleFieldClick('props.title')}
                  data-field="props.title"
                >
                  {config.props.title}
                </h1>
                <p
                  className="text-sm cq-lg:text-base text-gray-400 leading-relaxed"
                  onClick={() => handleFieldClick('props.description')}
                  data-field="props.description"
                >
                  {config.props.description || 'Share a little more about yourself.'}
                </p>
              </motion.div>

              {/* 
                Form Fields
                STANDARD INPUT HEIGHT: h-11 (44px)
                STANDARD INPUT TEXT: text-base sm:text-sm (16px on mobile prevents iOS zoom)
                STANDARD LABEL: text-xs lg:text-sm
                Gap between fields: gap-4 lg:gap-5
              */}
              <form className="flex w-full flex-col gap-3 cq-lg:gap-4 text-white">

                {/* Name Field */}
                {config.props.fields.name.enabled && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full flex flex-col gap-1 cq-lg:gap-1.5"
                  >
                    <label
                      htmlFor="name"
                      className="font-medium text-xs cq-lg:text-sm text-gray-400 block text-left"
                      onClick={() => handleFieldClick('props.fields.name.label')}
                      data-field="props.fields.name.label"
                    >
                      {config.props.fields.name.label}
                      {config.props.fields.name.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formState.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder={config.props.fields.name.placeholder}
                      className={`h-10 cq-lg:h-11 bg-gray-900 rounded-lg border text-base sm:text-sm text-white px-4 
                        focus:ring-2 focus:outline-none 
                        transition-all w-full placeholder-gray-500
                        ${touched.name && validationErrors.name ? 'border-red-500' : 'border-gray-700'}`}
                      style={{
                        '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}80`
                      } as React.CSSProperties}
                      onClick={() => handleFieldClick('props.fields.name.placeholder')}
                      data-field="props.fields.name.placeholder"
                    />
                    {touched.name && validationErrors.name && (
                      <span className="text-xs text-red-400 mt-0.5">{validationErrors.name}</span>
                    )}
                  </motion.div>
                )}

                {/* Email Field */}
                {config.props.fields.email.enabled && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="w-full flex flex-col gap-1 cq-lg:gap-1.5"
                  >
                    <label
                      htmlFor="email"
                      className="font-medium text-xs cq-lg:text-sm text-gray-400 block text-left"
                      onClick={() => handleFieldClick('props.fields.email.label')}
                      data-field="props.fields.email.label"
                    >
                      {config.props.fields.email.label}
                      {config.props.fields.email.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder={config.props.fields.email.placeholder}
                      className={`h-10 cq-lg:h-11 bg-gray-900 rounded-lg border text-base sm:text-sm text-white px-4 
                        focus:ring-2 focus:outline-none 
                        transition-all w-full placeholder-gray-500
                        ${touched.email && validationErrors.email ? 'border-red-500' : 'border-gray-700'}`}
                      style={{
                        '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}80`
                      } as React.CSSProperties}
                      onClick={() => handleFieldClick('props.fields.email.placeholder')}
                      data-field="props.fields.email.placeholder"
                    />
                    {touched.email && validationErrors.email && (
                      <span className="text-xs text-red-400 mt-0.5">{validationErrors.email}</span>
                    )}
                  </motion.div>
                )}

                {/* 
                  Avatar/Photo Section
                  RESPONSIVE AVATAR: w-12 h-12 → lg:w-14 lg:h-14
                  RESPONSIVE BUTTON: h-10 (secondary button height)
                */}
                {config.props.fields.avatar.enabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col gap-1 cq-lg:gap-1.5 pt-1 cq-lg:pt-2"
                  >
                    <label
                      className="font-medium text-xs cq-lg:text-sm text-gray-400"
                      onClick={() => handleFieldClick('props.fields.avatar.label')}
                      data-field="props.fields.avatar.label"
                    >
                      {config.props.fields.avatar.label}
                      {config.props.fields.avatar.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <div className="flex items-center gap-2 cq-lg:gap-3">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />

                      <Avatar
                        className={`w-10 h-10 cq-lg:w-12 cq-lg:h-12 border-2 shadow-sm ${touched.avatar && validationErrors.avatar ? 'border-red-500' : ''
                          }`}
                        style={{
                          borderColor: touched.avatar && validationErrors.avatar
                            ? undefined
                            : `${theme?.primaryColor || '#A855F7'}33`
                        }}
                      >
                        {formState.avatarUrl ? (
                          <AvatarImage src={formState.avatarUrl} alt="Profile" />
                        ) : (
                          <>
                            <AvatarImage src="" alt="" />
                            <AvatarFallback className="bg-gray-800 text-gray-400 text-xs">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <button
                        type="button"
                        onClick={handlePickImage}
                        aria-label="Pick an image"
                        className="h-9 cq-lg:h-10 px-3 cq-lg:px-4 rounded-lg bg-gray-800 border border-gray-700 
                          text-xs cq-lg:text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 
                          transition-colors"
                      >
                        {formState.avatarUrl ? 'Change image' : 'Pick an image'}
                      </button>
                    </div>
                    {(uploadError || (touched.avatar && validationErrors.avatar)) && (
                      <span className="text-xs text-red-400 mt-0.5">
                        {uploadError || validationErrors.avatar}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* 
                  Continue Button
                  STANDARD HEIGHT: h-11 → lg:h-12
                  STANDARD TEXT: text-sm → lg:text-base font-semibold
                  Spacing: mt-4 → lg:mt-6
                */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-3 cq-lg:mt-5"
                >
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!isFormValid}
                    className={`w-full h-10 cq-lg:h-11 rounded-xl 
                      text-sm cq-lg:text-base font-semibold 
                      transition-all duration-300
                      ${isFormValid
                        ? 'shadow-lg active:scale-[0.98] hover:opacity-90'
                        : 'bg-gray-800/80 text-gray-500 cursor-not-allowed'}`}
                    style={isFormValid ? getPrimaryButtonStyles(theme?.primaryColor) : undefined}
                    data-field="props.buttonText"
                  >
                    {config.props.buttonText}
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default AboutYouCard;

