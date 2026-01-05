import React, { useState } from 'react';
import { FormCard, FormCardProps } from '@/components/form-builder/FormCard';
import AppBar from '@/components/ui/app-bar';
import BackButton from '@/components/ui/back-button';
import { PrivateFeedbackBlockConfig } from '@/types/form-config';
import { motion } from 'framer-motion';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PrivateFeedbackCardProps extends FormCardProps {
  config: PrivateFeedbackBlockConfig;
  onFieldFocus: (blockId: string, fieldPath: string) => void;
}

const PrivateFeedbackCard: React.FC<PrivateFeedbackCardProps> = ({ config, onFieldFocus, theme, ...props }) => {
  // Get form data context (safe version returns null if not in provider)
  const formDataContext = useFormDataSafe();

  // Initialize from context if available (for navigating back)
  const [feedbackText, setFeedbackText] = useState(() =>
    formDataContext?.data.testimonial?.type === 'text'
      ? formDataContext.data.testimonial.text || ''
      : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  const handleFieldClick = (fieldPath: string) => {
    onFieldFocus(config.id, fieldPath);
  };

  const hasContent = feedbackText.length > 0;

  return (
    <FormCard {...props} theme={theme}>
      {/* 
        Layout: Centered content with focused width
        
        RESPONSIVE STRATEGY:
        - Container constrained to max-w-lg (narrower than standard xl/2xl)
        - Premium spacing and visual hierarchy
      */}
      <div className="flex-grow flex flex-col overflow-hidden relative">

        {/* Back Button */}
        {props.onPrevious && <BackButton onClick={props.onPrevious} />}

        {/* AppBar */}
        <div className="flex-shrink-0">
          <AppBar
            maxWidthClass="max-w-lg" // Narrower width match
            paddingXClass="px-6 sm:px-8"
            logoUrl={theme?.logoUrl}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto w-full">
          <div className="w-full px-6 sm:px-8 pb-8 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full max-w-lg" // Constrained width
            >
              {/* 
                Header Section
                - Centered text
                - Lock icon badge for visual context
              */}
              <div className="text-center mb-10">


                <h1
                  className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-white mb-3"
                  style={{ color: config.props.titleColor, fontFamily: theme?.headingFont }}
                  onClick={() => handleFieldClick('props.title')}
                  data-field="props.title"
                >
                  {config.props.title}
                </h1>
                <p
                  className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto"
                  onClick={() => handleFieldClick('props.description')}
                  data-field="props.description"
                >
                  {config.props.description || "Your feedback helps us improve. This stays private and will not be published."}
                </p>
              </div>

              {/* 
                Premium Textarea Section
                - Apple/Figma style glassmorphism
                - Focus states
                - Spacious padding
              */}
              <div className="space-y-6">
                <div
                  className={`relative rounded-2xl transition-all duration-300 group
                    ${isFocused
                      ? 'bg-zinc-900/90 ring-2 shadow-2xl'
                      : 'bg-zinc-900/40 hover:bg-zinc-900/60'
                    }
                    border ${isFocused ? '' : 'border-zinc-800/50 hover:border-zinc-700/50'}
                  `}
                  style={isFocused ? {
                    '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}66`,
                    borderColor: `${theme?.primaryColor || '#A855F7'}33`,
                    boxShadow: `0 25px 50px -12px ${theme?.primaryColor || '#A855F7'}1A`
                  } as React.CSSProperties : undefined}
                >
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={config.props.placeholder || "Type your message..."}
                    className="w-full min-h-[200px] bg-transparent p-6 sm:p-8 
                      text-base text-white placeholder-zinc-600 
                      focus:outline-none resize-none leading-relaxed tracking-wide"
                    style={{ caretColor: theme?.primaryColor || '#A855F7' }}
                    onClick={() => handleFieldClick('props.placeholder')}
                    data-field="props.placeholder"
                  />


                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-4">
                  <span className={`text-xs font-mono transition-colors duration-300 ${hasContent ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    {feedbackText.length.toLocaleString()} characters
                  </span>

                  <button
                    type="button"
                    className={`px-8 h-12 rounded-xl font-semibold text-sm transition-all duration-300 
                      ${hasContent
                        ? 'shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }
                    `}
                    style={hasContent ? getPrimaryButtonStyles(theme?.primaryColor) : undefined}
                    onClick={() => {
                      if (hasContent) {
                        handleFieldClick('props.buttonText');
                        props.onNext();
                      }
                    }}
                    disabled={!hasContent}
                    data-field="props.buttonText"
                  >
                    {config.props.buttonText || "Send Private Feedback"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default PrivateFeedbackCard;
