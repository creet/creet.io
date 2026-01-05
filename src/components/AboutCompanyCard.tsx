import React, { useState, useMemo, useRef } from 'react';
import { FormCardProps } from '@/components/form-builder/FormCard';
import { FormCard } from '@/components/form-builder/FormCard';
import { motion } from 'framer-motion';
import AppBar from '@/components/ui/app-bar';
import BackButton from '@/components/ui/back-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AboutCompanyBlockConfig } from '@/types/form-config';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (required check is separate)
  try {
    // Check if it's a valid URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    return urlPattern.test(url);
  } catch {
    return false;
  }
};

// Allowed image types for logo upload (supports iPhone HEIC, web images, and standard formats)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AboutCompanyCardProps extends Omit<FormCardProps, 'config' | 'onFieldFocus'> {
  config: AboutCompanyBlockConfig;
  onFieldFocus: (blockId: string, fieldPath: string) => void;
}

interface FormState {
  companyName: string;
  jobTitle: string;
  companyWebsite: string;
  companyLogoUrl: string | null;
}

interface ValidationErrors {
  companyName?: string;
  jobTitle?: string;
  companyWebsite?: string;
  companyLogo?: string;
}

const AboutCompanyCard: React.FC<AboutCompanyCardProps> = ({ config, onFieldFocus, theme, ...props }) => {
  // Get form data context (safe version returns null if not in provider)
  const formDataContext = useFormDataSafe();

  // Form state - initialize from context if available
  const [formState, setFormState] = useState<FormState>(() => ({
    companyName: formDataContext?.data.aboutCompany?.companyName || '',
    jobTitle: formDataContext?.data.aboutCompany?.jobTitle || '',
    companyWebsite: formDataContext?.data.aboutCompany?.companyWebsite || '',
    companyLogoUrl: formDataContext?.data.aboutCompany?.companyLogoUrl || null,
  }));

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input ref for logo upload
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

  // Handle logo image selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setFormState(prev => ({ ...prev, companyLogoUrl: localUrl }));
    setTouched(prev => ({ ...prev, companyLogo: true }));
  };

  // Trigger file input click
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  // Validation logic
  const validationErrors = useMemo((): ValidationErrors => {
    const errors: ValidationErrors = {};
    const fields = config.props.fields;

    // Company Name validation
    if (fields.companyName.enabled && fields.companyName.required && !formState.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }

    // Job Title validation
    if (fields.jobTitle.enabled && fields.jobTitle.required && !formState.jobTitle.trim()) {
      errors.jobTitle = 'Job title is required';
    }

    // Website validation
    if (fields.companyWebsite.enabled && fields.companyWebsite.required) {
      if (!formState.companyWebsite.trim()) {
        errors.companyWebsite = 'Website is required';
      } else if (!isValidUrl(formState.companyWebsite)) {
        errors.companyWebsite = 'Please enter a valid URL';
      }
    } else if (formState.companyWebsite && !isValidUrl(formState.companyWebsite)) {
      errors.companyWebsite = 'Please enter a valid URL';
    }

    // Logo validation
    if (fields.companyLogo.enabled && fields.companyLogo.required && !formState.companyLogoUrl) {
      errors.companyLogo = 'Company logo is required';
    }

    return errors;
  }, [formState, config.props.fields]);

  // Check if form is valid
  const isFormValid = Object.keys(validationErrors).length === 0;

  // Handle continue click
  const handleContinue = () => {
    // Mark all fields as touched to show errors
    setTouched({
      companyName: true,
      jobTitle: true,
      companyWebsite: true,
      companyLogo: true,
    });

    if (isFormValid) {
      // Store form data in context
      if (formDataContext) {
        formDataContext.setAboutCompany({
          companyName: formState.companyName,
          jobTitle: formState.jobTitle,
          companyWebsite: formState.companyWebsite || undefined,
          companyLogoUrl: formState.companyLogoUrl || undefined,
        });
      }
      props.onNext();
    }
  };

  return (
    <FormCard {...props} theme={theme}>
      {/* 
        Layout: Centered form with responsive padding
        Matches the AboutYouCard layout for consistency
        
        STRUCTURE:
        - Row 1: Company Name + Job Title (side-by-side on sm+)
        - Row 2: Company Website (full width with globe icon)
        - Row 3: Company Logo (avatar + upload button, like AboutYouCard avatar)
      */}
      <div className="flex-grow flex flex-col overflow-hidden relative">

        {/* Back Button */}
        {props.onPrevious && <BackButton onClick={props.onPrevious} />}

        {/* AppBar with Logo */}
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

              {/* Header Section */}
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
                  {config.props.description || 'Help us understand your business better.'}
                </p>
              </motion.div>

              {/* Form Fields */}
              <form className="flex w-full flex-col gap-3 cq-lg:gap-4 text-white">

                {/* Row 1: Company Name + Job Title (Side by Side) */}
                <div className="flex flex-col sm:flex-row gap-3 cq-lg:gap-4">
                  {/* Company Name Field */}
                  {config.props.fields.companyName.enabled && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex-1 flex flex-col gap-1 cq-lg:gap-1.5"
                    >
                      <label
                        htmlFor="companyName"
                        className="font-medium text-xs cq-lg:text-sm text-gray-400 block text-left"
                        onClick={() => handleFieldClick('props.fields.companyName.label')}
                        data-field="props.fields.companyName.label"
                      >
                        {config.props.fields.companyName.label}
                        {config.props.fields.companyName.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={formState.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        onBlur={() => handleBlur('companyName')}
                        placeholder={config.props.fields.companyName.placeholder}
                        className={`h-10 cq-lg:h-11 bg-gray-900 rounded-lg border text-base sm:text-sm text-white px-4 
                          focus:ring-2 focus:outline-none 
                          transition-all w-full placeholder-gray-500
                          ${touched.companyName && validationErrors.companyName ? 'border-red-500' : 'border-gray-700'}`}
                        style={{
                          '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}80`
                        } as React.CSSProperties}
                        onClick={() => handleFieldClick('props.fields.companyName.placeholder')}
                        data-field="props.fields.companyName.placeholder"
                      />
                      {touched.companyName && validationErrors.companyName && (
                        <span className="text-xs text-red-400 mt-0.5">{validationErrors.companyName}</span>
                      )}
                    </motion.div>
                  )}

                  {/* Job Title Field */}
                  {config.props.fields.jobTitle.enabled && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      className="flex-1 flex flex-col gap-1 cq-lg:gap-1.5"
                    >
                      <label
                        htmlFor="jobTitle"
                        className="font-medium text-xs cq-lg:text-sm text-gray-400 block text-left"
                        onClick={() => handleFieldClick('props.fields.jobTitle.label')}
                        data-field="props.fields.jobTitle.label"
                      >
                        {config.props.fields.jobTitle.label}
                        {config.props.fields.jobTitle.required && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        value={formState.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        onBlur={() => handleBlur('jobTitle')}
                        placeholder={config.props.fields.jobTitle.placeholder}
                        className={`h-10 cq-lg:h-11 bg-gray-900 rounded-lg border text-base sm:text-sm text-white px-4 
                          focus:ring-2 focus:outline-none 
                          transition-all w-full placeholder-gray-500
                          ${touched.jobTitle && validationErrors.jobTitle ? 'border-red-500' : 'border-gray-700'}`}
                        style={{
                          '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}80`
                        } as React.CSSProperties}
                        onClick={() => handleFieldClick('props.fields.jobTitle.placeholder')}
                        data-field="props.fields.jobTitle.placeholder"
                      />
                      {touched.jobTitle && validationErrors.jobTitle && (
                        <span className="text-xs text-red-400 mt-0.5">{validationErrors.jobTitle}</span>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Row 2: Company Website (Full Width with Icon) */}
                {config.props.fields.companyWebsite.enabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full flex flex-col gap-1 cq-lg:gap-1.5"
                  >
                    <label
                      htmlFor="companyWebsite"
                      className="font-medium text-xs cq-lg:text-sm text-gray-400 block text-left"
                      onClick={() => handleFieldClick('props.fields.companyWebsite.label')}
                      data-field="props.fields.companyWebsite.label"
                    >
                      {config.props.fields.companyWebsite.label}
                      {config.props.fields.companyWebsite.required
                        ? <span className="text-red-500 ml-0.5">*</span>
                        : <span className="text-gray-500 ml-1">(optional)</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <GlobeIcon className="w-4 h-4 cq-lg:w-5 cq-lg:h-5 text-gray-500" />
                      </div>
                      <input
                        id="companyWebsite"
                        name="companyWebsite"
                        type="url"
                        value={formState.companyWebsite}
                        onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                        onBlur={() => handleBlur('companyWebsite')}
                        placeholder={config.props.fields.companyWebsite.placeholder}
                        className={`h-10 cq-lg:h-11 bg-gray-900 rounded-lg border text-base sm:text-sm text-white pl-10 cq-lg:pl-11 pr-4 
                          focus:ring-2 focus:outline-none 
                          transition-all w-full placeholder-gray-500
                          ${touched.companyWebsite && validationErrors.companyWebsite ? 'border-red-500' : 'border-gray-700'}`}
                        style={{
                          '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}80`
                        } as React.CSSProperties}
                        onClick={() => handleFieldClick('props.fields.companyWebsite.placeholder')}
                        data-field="props.fields.companyWebsite.placeholder"
                      />
                    </div>
                    {touched.companyWebsite && validationErrors.companyWebsite && (
                      <span className="text-xs text-red-400 mt-0.5">{validationErrors.companyWebsite}</span>
                    )}
                  </motion.div>
                )}

                {/* Row 3: Company Logo (Avatar + Upload Button - Same as AboutYouCard) */}
                {config.props.fields.companyLogo.enabled && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="flex flex-col gap-1 cq-lg:gap-1.5 pt-1 cq-lg:pt-2"
                  >
                    <label
                      className="font-medium text-xs cq-lg:text-sm text-gray-400"
                      onClick={() => handleFieldClick('props.fields.companyLogo.label')}
                      data-field="props.fields.companyLogo.label"
                    >
                      {config.props.fields.companyLogo.label}
                      {config.props.fields.companyLogo.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <div className="flex items-center gap-2 cq-lg:gap-3">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={handleLogoChange}
                        className="hidden"
                      />

                      <Avatar
                        className={`w-10 h-10 cq-lg:w-12 cq-lg:h-12 border-2 shadow-sm rounded-lg ${touched.companyLogo && validationErrors.companyLogo ? 'border-red-500' : ''
                          }`}
                        style={{
                          borderColor: touched.companyLogo && validationErrors.companyLogo
                            ? undefined
                            : `${theme?.primaryColor || '#A855F7'}33`
                        }}
                      >
                        {formState.companyLogoUrl ? (
                          <AvatarImage src={formState.companyLogoUrl} alt="Company Logo" />
                        ) : (
                          <>
                            <AvatarImage src="" alt="" />
                            <AvatarFallback className="bg-gray-800 text-gray-400 text-xs rounded-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <button
                        type="button"
                        onClick={handlePickImage}
                        aria-label="Upload logo"
                        className="h-9 cq-lg:h-10 px-3 cq-lg:px-4 rounded-lg bg-gray-800 border border-gray-700 
                          text-xs cq-lg:text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 
                          transition-colors"
                      >
                        {formState.companyLogoUrl ? 'Change logo' : 'Upload logo'}
                      </button>
                    </div>
                    {(uploadError || (touched.companyLogo && validationErrors.companyLogo)) && (
                      <span className="text-xs text-red-400 mt-0.5">
                        {uploadError || validationErrors.companyLogo}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Continue Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
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

export default AboutCompanyCard;
