import React, { useState } from 'react';
import { FormCardProps } from '@/components/form-builder/FormCard';
import { FormCard } from '@/components/form-builder/FormCard';
import { motion, AnimatePresence } from 'framer-motion';
import { RatingBlockConfig, FormBlockType } from '@/types/form-config';
import BackButton from '@/components/ui/back-button';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// ICON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RatingCardProps extends Omit<FormCardProps, 'config'> {
  config: RatingBlockConfig;
}

const StarIcon = ({ filled, className, style }: { filled: boolean; className?: string; style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const RatingCard: React.FC<RatingCardProps> = ({ config, onFieldFocus, theme, formSettings, onNavigateToBlockType, ...props }) => {
  // Get form data context (safe version returns null if not in provider)
  const formDataContext = useFormDataSafe();

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  // Initialize selectedRating from context if available
  const [selectedRating, setSelectedRating] = useState<number | null>(() => formDataContext?.data.rating ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const ratingLabels = [
    "Not satisfied",
    "Could be better",
    "Good",
    "Great",
    "Excellent!"
  ];

  const handleStarClick = (rating: number) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSelectedRating(rating);

    // Get the low rating threshold (default to 3 if not set)
    const threshold = formSettings?.lowRatingThreshold ?? 3;
    const shouldShowImprovementTips = rating < threshold;

    // Store rating in context (if available)
    if (formDataContext) {
      formDataContext.setRating(rating, shouldShowImprovementTips);
    }

    // Auto-advance with a delay so user sees their selection
    setTimeout(() => {
      if (onNavigateToBlockType) {
        // Use conditional navigation based on rating
        if (shouldShowImprovementTips) {
          onNavigateToBlockType(FormBlockType.NegativeFeedback);
        } else {
          onNavigateToBlockType(FormBlockType.Question);
        }
      } else {
        // Fallback to simple next
        props.onNext();
      }
    }, 600);
  };

  const handleFieldClick = (fieldPath: string) => {
    onFieldFocus?.(config.id, fieldPath);
  };

  return (
    <FormCard {...props} theme={theme}>
      {/* 
        Layout: Centered content with responsive padding
        
        RESPONSIVE STRATEGY:
        - Form Builder (~800-1000px container): Uses base/sm styles
        - Preview/Public (full viewport): lg: breakpoints trigger for larger sizing
        
        Padding scales: px-6 → sm:px-8 → lg:px-12
        Vertical: py-8 → lg:py-12
      */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 sm:px-8 cq-lg:px-12 py-8 cq-lg:py-12 text-center overflow-hidden relative">

        {/* Back Button */}
        {props.onPrevious && <BackButton onClick={props.onPrevious} />}

        {/* Background glow effect */}
        <div
          className="absolute inset-0 blur-3xl"
          style={{
            background: `radial-gradient(circle at center, ${theme?.primaryColor || '#A855F7'}0D 0%, transparent 70%)`
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-xl cq-lg:max-w-2xl mx-auto"
        >
          {/* 
            Brand Logo
            RESPONSIVE: h-10 → sm:h-12 → lg:h-14 (40px → 48px → 56px)
            Spacing below: mb-8 → lg:mb-10 (32px → 40px)
          */}
          {theme?.logoUrl && (
            <div className="flex justify-center items-center mb-8 cq-lg:mb-10">
              <img
                src={theme.logoUrl}
                alt="Brand Logo"
                className="h-10 sm:h-12 cq-lg:h-14 w-auto object-contain"
              />
            </div>
          )}

          {/* 
            Main Content
            RESPONSIVE TITLE: text-2xl → sm:text-3xl → cq-lg:text-4xl (matches WelcomeCard)
            RESPONSIVE DESC: text-sm → cq-lg:text-base
            Gap: space-y-3 → cq-lg:space-y-4
          */}
          <div className="space-y-3 cq-lg:space-y-4 mb-8 cq-lg:mb-10">
            <h1
              className="text-3xl sm:text-4xl cq-lg:text-5xl font-bold leading-tight tracking-tight text-white"
              style={{ color: config.props.titleColor, fontFamily: theme?.headingFont }}
              onClick={() => handleFieldClick('props.title')}
              data-field="props.title"
            >
              {config.props.title}
            </h1>
            <p
              className="text-sm cq-lg:text-base text-gray-400 leading-relaxed max-w-md cq-lg:max-w-lg mx-auto"
              style={{ color: config.props.descriptionColor }}
              onClick={() => handleFieldClick('props.description')}
              data-field="props.description"
            >
              {config.props.description}
            </p>
          </div>

          {/* 
            Star Rating Section
            RESPONSIVE STARS: w-10 h-10 → sm:w-12 sm:h-12 → lg:w-14 lg:h-14
            Gap between stars: gap-2 → sm:gap-3 → lg:gap-4
          */}
          <div className="py-2 sm:py-4">
            <div className="flex justify-center items-center gap-2 sm:gap-3 cq-lg:gap-4 mb-4 cq-lg:mb-6">
              {[1, 2, 3, 4, 5].map((rating) => {
                const isHovered = hoveredStar !== null && rating <= hoveredStar;
                const isSelected = selectedRating !== null && rating <= selectedRating;
                const isFilled = isSelected || isHovered;
                const isDimmed = selectedRating !== null && rating > selectedRating;

                return (
                  <div
                    key={rating}
                    className="relative group"
                    onMouseEnter={() => !isSubmitting && setHoveredStar(rating)}
                    onMouseLeave={() => !isSubmitting && setHoveredStar(null)}
                  >
                    <motion.button
                      onClick={() => handleStarClick(rating)}
                      disabled={isSubmitting}
                      whileHover={!isSubmitting ? { scale: 1.1 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                      animate={isSelected ? { scale: [1, 1.2, 1] } : { opacity: isDimmed ? 0.3 : 1 }}
                      transition={{ duration: 0.3 }}
                      className={`relative cursor-pointer transition-all duration-300 ease-out 
                        ${isSubmitting ? 'cursor-default' : ''}`}
                      style={{ color: isFilled ? (theme?.ratingColor || '#FBBF24') : undefined }}
                      aria-label={`Rate ${rating} stars`}
                    >
                      {isFilled && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0"
                        >
                          <StarIcon
                            filled={true}
                            className="w-10 h-10 sm:w-12 sm:h-12 cq-lg:w-14 cq-lg:h-14 absolute inset-0 blur-sm opacity-60"
                            style={{ color: theme?.ratingColor || '#FBBF24' }}
                          />
                        </motion.div>
                      )}

                      {/* Main star - Responsive sizing */}
                      <StarIcon
                        filled={isFilled}
                        className={`w-10 h-10 sm:w-12 sm:h-12 cq-lg:w-14 cq-lg:h-14 relative z-10 transition-all duration-300 
                          ${isFilled ? 'filter brightness-110' : ''}
                          ${!isFilled ? 'text-gray-600 group-hover:text-gray-400' : ''}`}
                        style={{
                          color: isFilled ? (theme?.ratingColor || '#FBBF24') : undefined,
                          filter: isFilled ? `drop-shadow(0 0 12px ${theme?.ratingColor || '#FBBF24'}80)` : undefined
                        }}
                      />

                      {/* Hover pulse effect */}
                      {!isSubmitting && (
                        <motion.div
                          className="absolute inset-0 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: `${theme?.ratingColor || '#FBBF24'}33` }}
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {/* 
              Rating Label and Selection Feedback
              RESPONSIVE: text-sm → lg:text-base
            */}
            <div className="h-6 cq-lg:h-8">
              <AnimatePresence mode="wait">
                {(hoveredStar !== null || selectedRating !== null) && (
                  <motion.p
                    key={hoveredStar || selectedRating}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm cq-lg:text-base font-medium"
                    style={{ color: selectedRating ? (theme?.ratingColor || '#FBBF24') : (theme?.primaryColor || '#A855F7') }}
                  >
                    {selectedRating
                      ? `You selected ${ratingLabels[selectedRating - 1]}`
                      : ratingLabels[hoveredStar! - 1]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

        </motion.div>
      </div>
    </FormCard>
  );
};

export default RatingCard;

