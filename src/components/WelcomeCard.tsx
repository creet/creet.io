import React, { useState } from 'react';
import { FormCard, FormCardProps } from '@/components/form-builder/FormCard';
import { Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { WelcomeBlockConfig } from '@/types/form-config';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS - Inline with text (scales with lg: for full-screen)
// ═══════════════════════════════════════════════════════════════════════════

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface WelcomeCardProps extends Omit<FormCardProps, 'config' | 'onFieldFocus'> {
    config: WelcomeBlockConfig;
    onFieldFocus?: (blockId: string, fieldPath: string) => void;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ config, onFieldFocus, theme, ...props }) => {
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
            <div className="relative flex-grow flex flex-col items-center justify-center px-6 sm:px-8 cq-lg:px-12 py-8 cq-lg:py-12 text-center overflow-hidden">

                {/* Background Glow Effect */}
                <div className="absolute -inset-24 bg-lime-400/10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] blur-3xl opacity-60" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-xl cq-lg:max-w-2xl"
                >
                    {/* 
                      Company Branding
                      RESPONSIVE: h-10 → sm:h-12 → lg:h-14 (40px → 48px → 56px)
                      Spacing: mb-8 → lg:mb-10 (32px → 40px)
                    */}
                    {theme?.logoUrl && (
                        <div className="flex justify-center items-center mb-8 cq-lg:mb-10">
                            <img
                                className="h-10 sm:h-12 cq-lg:h-14 w-auto object-contain"
                                src={theme.logoUrl}
                                alt="Brand Logo"
                            />
                        </div>
                    )}

                    {/* 
                      Main Content
                      RESPONSIVE TITLE: text-3xl → sm:text-4xl → cq-lg:text-5xl (30px → 36px → 48px)
                      Enhanced with gradient for premium first impression
                      RESPONSIVE DESC: text-sm → cq-lg:text-base (14px → 16px)
                      Gap: space-y-3 → cq-lg:space-y-4 (12px → 16px)
                    */}
                    <div className="space-y-3 cq-lg:space-y-4">
                        <h1
                            className="text-4xl sm:text-5xl cq-lg:text-6xl font-bold leading-tight tracking-tight 
                                bg-gradient-to-r from-white via-purple-100 to-violet-200 bg-clip-text text-transparent"
                            style={{
                                color: config.props.titleColor !== '#FFFFFF' ? config.props.titleColor : undefined,
                                fontFamily: theme?.headingFont
                            }}
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
                      CTA Button
                      RESPONSIVE HEIGHT: h-11 → lg:h-12 (44px → 48px)
                      RESPONSIVE TEXT: text-sm → lg:text-base (14px → 16px)
                      RESPONSIVE PADDING: px-8 → lg:px-10
                      Spacing: mt-8 → lg:mt-10 (32px → 40px)
                    */}
                    <div className="mt-8 cq-lg:mt-10">
                        <motion.button
                            onClick={props.onNext}
                            whileHover={{ scale: 1.03, boxShadow: `0px 0px 30px ${theme?.primaryColor || '#A855F7'}50` }}
                            whileTap={{ scale: 0.97 }}
                            className="h-11 cq-lg:h-12 px-8 cq-lg:px-10 text-sm cq-lg:text-base font-semibold rounded-xl transition-all duration-200 min-w-[160px] cq-lg:min-w-[180px]"
                            style={getPrimaryButtonStyles(theme?.primaryColor)}
                            onClickCapture={() => handleFieldClick('props.buttonText')}
                            data-field="props.buttonText"
                        >
                            {config.props.buttonText}
                        </motion.button>
                    </div>

                    {/* 
                      Feature Highlights
                      RESPONSIVE TEXT: text-xs → lg:text-sm (12px → 14px)
                      RESPONSIVE ICONS: w-4 h-4 → lg:w-5 lg:h-5 (16px → 20px)
                      Spacing: mt-6 → lg:mt-8 (24px → 32px)
                      Gap: gap-4 sm:gap-6 → lg:gap-8
                    */}
                    <div className="mt-6 cq-lg:mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 cq-lg:gap-8 text-xs cq-lg:text-sm text-gray-500">
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:text-gray-400 transition-colors"
                            onClick={() => handleFieldClick('props.timingMessage')}
                            data-field="props.timingMessage"
                        >
                            <ClockIcon className="w-4 h-4 cq-lg:w-5 cq-lg:h-5 flex-shrink-0" />
                            <span>{config.props.timingMessage}</span>
                        </div>
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:text-gray-400 transition-colors"
                            onClick={() => handleFieldClick('props.consentMessage')}
                            data-field="props.consentMessage"
                        >
                            <CheckCircleIcon className="w-4 h-4 cq-lg:w-5 cq-lg:h-5 flex-shrink-0" />
                            <span>{config.props.consentMessage}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </FormCard>
    );
};

export default WelcomeCard;



