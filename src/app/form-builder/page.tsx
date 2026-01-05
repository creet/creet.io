"use client";

import React, { Suspense, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import RatingCard from '@/components/RatingCard';
// import FormBuilderSidebar from '@/components/FormBuilderSidebar';
import NegativeFeedbackCard from '@/components/NegativeFeedbackCard';
import QuestionCard from '@/components/QuestionCard';
import PrivateFeedbackCard from '@/components/PrivateFeedbackCard';
import ConsentCard from '@/components/ConsentCard';
import AboutYouCard from '@/components/AboutYouCard';
import AboutCompanyCard from '@/components/AboutCompanyCard';
import ReadyToSendCard from '@/components/ReadyToSendCard';
import ThankYouCard from '@/components/ThankYouCard';
import WelcomeCard from '@/components/WelcomeCard';
import { motion, AnimatePresence } from "framer-motion";

import { type FormConfig, type FormBlock, FormBlockType, type FormTheme, type FormSettings } from '@/types/form-config';
import FormBuilderEditPanel from '@/components/edit-panels/FormBuilderEditPanel';
import FormRenderer from '@/components/public-form/FormRenderer';
import { FormDataProvider } from '@/components/public-form/FormDataContext';
import PagesPanel from '@/components/form-builder/PagesPanel';
import GlobalSettingsPanel from '@/components/form-builder/GlobalSettingsPanel';
import { toast, Toaster } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const PagesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Outer ring */}
    <circle cx="12" cy="12" r="7.25" stroke="currentColor" />

    {/* Inner ring for depth */}
    <circle cx="12" cy="12" r="4.6" stroke="currentColor" />

    {/* Hub */}
    <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />

    {/* Teeth (12) */}
    <g fill="currentColor" stroke="none">
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" />
      <rect x="11.2" y="19.8" width="1.6" height="3" rx="0.6" transform="rotate(180 12 21.3)" />

      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(30 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(60 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(90 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(120 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(150 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(210 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(240 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(270 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(300 12 12)" />
      <rect x="11.2" y="1.2" width="1.6" height="3" rx="0.6" transform="rotate(330 12 12)" />
    </g>
  </svg>
);

const RewardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

const FormIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const PreviewIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);



const defaultTheme: FormTheme = {
  backgroundColor: '#0A0A0A',
  logoUrl: '',
  primaryColor: '#BFFF00', // Brand lime (matches Brand page defaults)
  ratingColor: '#fbbf24',  // Amber-400 for star ratings
  headingFont: 'Satoshi',
  bodyFont: 'Inter',
};

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

type NavItemProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

const NavItem = ({ children, icon, active = false, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${active
      ? 'bg-white/[0.08] text-white shadow-sm'
      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
      }`}
  >
    <div className={`transition-colors ${active ? 'text-white' : 'text-zinc-500'}`}>
      {icon}
    </div>
    <span className="font-medium">{children}</span>
  </button>
);

interface FormCardProps {
  // page: PageItem; - This will be replaced by a specific block config
  config: FormBlock;
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  onFieldFocus: (blockId: string, fieldPath: string) => void;
  // onToggle: (id: string) => void; - This will be handled in the main page
  // onDelete?: (id: string) => void; - This will be handled in the main page
  // onDelete?: (id: string) => void; - This will be handled in the main page
  // isDeletable?: boolean;
  theme: FormTheme;
  isPreview?: boolean;
  formSettings?: FormSettings; // Access to form settings (e.g., lowRatingThreshold)
  onNavigateToBlockType?: (blockType: FormBlockType) => void; // Conditional navigation to specific block type
}

const FormCard: React.FC<React.PropsWithChildren<Omit<FormCardProps, 'config' | 'onFieldFocus'>>> = ({
  children,
  currentPage,
  totalPages,
  onNext,
  onPrevious,
  isPreview = false,
}) => {
  // In preview mode: full screen, no page bar
  // In editor mode: constrained size with page bar
  // Add form-card-container class to enable CSS container queries
  // This makes child elements respond to container width, not viewport width
  const containerClass = isPreview
    ? "form-card-container w-full h-full bg-gray-950 overflow-hidden flex flex-col"
    : "form-card-container w-[96%] max-w-[1400px] 2xl:max-w-[1600px] h-[70vh] min-h-[600px] max-h-[700px] mx-auto bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50 flex flex-col";

  return (
    <div className={containerClass}>
      {/* Page navigation bar - hidden in preview mode */}
      {!isPreview && (
        <div className="relative px-8 py-3 border-b border-gray-800/50 flex items-center flex-none">
          {/* Left Side: Page Number and Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="bg-green-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center flex-none">
              {currentPage}
            </span>
          </div>

          {/* Center: Navigation (Absolutely Centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              onClick={onPrevious}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-xs font-semibold text-white">{currentPage}</span>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-gray-400">{totalPages}</span>
            </div>
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Side: Actions are now in the sidebar */}
          <div className="flex items-center gap-2 flex-1 justify-end">
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

// Editor card area component that uses FormDataContext for proper navigation
import { useFormData } from '@/components/public-form/FormDataContext';

interface EditorCardAreaProps {
  formConfig: FormConfig;
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  onFieldFocus: (blockId: string, fieldPath: string) => void;
}

const EditorCardArea: React.FC<EditorCardAreaProps> = ({
  formConfig,
  currentPageIndex,
  setCurrentPageIndex,
  onFieldFocus,
}) => {
  // Get form data from context for smart filtering
  const { data: formData } = useFormData();

  // Smart block filtering based on rating path (same logic as FormRenderer)
  const enabledBlocks = useMemo(() => {
    return formConfig.blocks.filter(b => {
      if (!b.enabled) return false;

      // Only filter when user has made a rating decision
      if (formData.rating !== null) {
        if (formData.shouldShowImprovementTips) {
          // Low Rating Path: Hide positive flow blocks
          const positiveFlowBlocks = [
            FormBlockType.Question,
            FormBlockType.Consent,
            FormBlockType.AboutYou,
            FormBlockType.AboutCompany,
            FormBlockType.ReadyToSend
          ];
          return !positiveFlowBlocks.includes(b.type);
        } else {
          // High Rating Path: Hide NegativeFeedback
          return b.type !== FormBlockType.NegativeFeedback;
        }
      }

      // Before rating is selected, show all blocks
      return true;
    });
  }, [formConfig.blocks, formData.rating, formData.shouldShowImprovementTips]);

  // Keep a ref to the latest enabledBlocks for use in callbacks
  const enabledBlocksRef = useRef(enabledBlocks);
  enabledBlocksRef.current = enabledBlocks;

  const totalPages = enabledBlocks.length;
  const safeIndex = Math.min(currentPageIndex, Math.max(0, totalPages - 1));
  const block = enabledBlocks[safeIndex];

  // Navigation handlers (use refs to avoid stale closures)
  const handleNext = useCallback(() => {
    const blocks = enabledBlocksRef.current;
    const total = blocks.length;
    setCurrentPageIndex(prev => {
      if (prev < total - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [setCurrentPageIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
  }, [setCurrentPageIndex]);

  const handleNavigateToBlockType = useCallback((targetBlockType: FormBlockType) => {
    const blocks = enabledBlocksRef.current;
    const targetIndex = blocks.findIndex(b => b.type === targetBlockType);
    if (targetIndex !== -1) {
      setCurrentPageIndex(targetIndex);
    } else {
      setCurrentPageIndex(prev => prev + 1);
    }
  }, [setCurrentPageIndex]);

  if (!block) return null;

  const cardProps = {
    config: block,
    currentPage: safeIndex + 1,
    totalPages,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onFieldFocus,
    theme: formConfig.theme,
    formSettings: formConfig.settings,
    onNavigateToBlockType: handleNavigateToBlockType,
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      {(() => {
        switch (block.type) {
          case FormBlockType.Welcome: return <WelcomeCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.Rating: return <RatingCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.Question: return <QuestionCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.NegativeFeedback: return <NegativeFeedbackCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.PrivateFeedback: return <PrivateFeedbackCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.Consent: return <ConsentCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.AboutYou: return <AboutYouCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.AboutCompany: return <AboutCompanyCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.ReadyToSend: return <ReadyToSendCard key={block.id} {...cardProps} config={block as any} />;
          case FormBlockType.ThankYou: return <ThankYouCard key={block.id} {...cardProps} config={block as any} rewards={formConfig?.rewards} brandName={formConfig?.settings?.brandName} />;
          default: return null;
        }
      })()}
    </div>
  );
};

const FormBuilderPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('id');

  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'edit'>('pages');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<{ blockId: string; fieldPath: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'form' | 'settings' | 'rewards'>('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires this
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!formId) {
      toast.error('No form ID provided');
      setIsLoading(false);
      return;
    }

    const fetchFormConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Form not found. It might have been deleted, or you may not have permission to view it.");
          } else {
            throw new Error('Failed to fetch form configuration');
          }
        } else {
          const data = await response.json();

          // Normalize blocks: convert old 'title' field to 'email' in AboutYou blocks
          let normalizedBlocks = (data.settings?.blocks || []).map((block: any) => {
            if (block.type === FormBlockType.AboutYou && block.props?.fields) {
              const fields = block.props.fields;
              // If 'title' exists but 'email' doesn't, convert title to email
              if (fields.title && !fields.email) {
                return {
                  ...block,
                  props: {
                    ...block.props,
                    fields: {
                      ...fields,
                      email: {
                        enabled: fields.title.enabled,
                        required: fields.title.required,
                        label: 'Email',
                        placeholder: 'john@example.com'
                      },
                      title: undefined // Remove old title field
                    }
                  }
                };
              }
            }
            return block;
          });

          const mergedConfig = {
            ...data.settings,
            id: data.id ?? data.settings?.id ?? formId,
            name: data.name ?? data.settings?.name ?? 'Untitled Form',
            projectId: data.project_id,
            theme: {
              ...defaultTheme,
              ...(data.settings?.theme ?? {}),
            },
            blocks: normalizedBlocks,
          } as FormConfig;
          setFormConfig(mergedConfig);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Could not load form data.');
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormConfig();
  }, [formId]);

  const handleFieldFocus = (blockId: string, fieldPath: string) => {
    setFocusedField({ blockId, fieldPath });
    setActiveTab('edit');
  };
  // enabledBlocks for sidebar (without smart filtering - shows all enabled blocks for editing)
  const enabledBlocks = useMemo(() => formConfig?.blocks.filter(b => b.enabled) || [], [formConfig]);

  // Simple navigation for keyboard arrows (used for sidebar editing, not form flow)
  const handleNextPage = useCallback(() => {
    setCurrentPageIndex(currentIndex => Math.min(currentIndex + 1, enabledBlocks.length - 1));
  }, [enabledBlocks.length]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPageIndex(currentIndex => Math.max(currentIndex - 1, 0));
  }, []);
  const handleSave = async () => {
    if (!formConfig) {
      toast.error('Cannot save form without an ID.');
      return;
    }
    if (!formId) {
      toast.error('No form ID provided');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Save failed');
      }

      toast.success('Form saved successfully!');
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast.error(`Failed to save form: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageClick = (index: number) => {
    setCurrentPageIndex(index);
  };

  const handleCopyLink = () => {
    if (!formId) return;
    const shareUrl = `${window.location.origin}/t/${formId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public link copied to clipboard!');
  };

  const handleTogglePage = (blockId: string) => {
    setFormConfig(prevConfig => {
      if (!prevConfig) return null;
      return {
        ...prevConfig,
        blocks: prevConfig.blocks.map(block =>
          block.id === blockId
            ? { ...block, enabled: !block.enabled }
            : block
        ),
      };
    });
    setHasUnsavedChanges(true);
  };


  const handleUpdatePageContent = (id: string, content: any) => {
    // This logic needs to be updated for the new structure
  };

  const handleUpdateBlock = (blockId: string, updatedProps: any) => {
    setFormConfig(prevConfig => {
      if (!prevConfig) return null;
      return {
        ...prevConfig,
        blocks: prevConfig.blocks.map(block =>
          block.id === blockId
            ? { ...block, props: { ...block.props, ...updatedProps } }
            : block
        ),
      };
    });
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const isTextInput = activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      if (isTextInput) {
        return; // Do not navigate if typing in a field
      }

      if (event.key === 'ArrowRight') {
        handleNextPage();
      } else if (event.key === 'ArrowLeft') {
        handlePreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextPage, handlePreviousPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090B] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-zinc-800 border-t-[#BFFF00] rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading form builder...</p>
        </div>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090B] text-white">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <div className="text-5xl mb-4">😢</div>
          <h1 className="text-2xl font-bold font-heading">Something went wrong</h1>
          <p className="text-zinc-400 max-w-md">{error || "The form configuration could not be loaded. It might not exist."}</p>
          <a href="/forms">
            <Button className="mt-6 bg-white hover:bg-zinc-100 text-black font-medium">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Forms
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-[#09090B] text-white">
      <Toaster position="bottom-right" theme="dark" />
      <header className="relative flex-none flex items-center justify-between h-16 px-6 bg-[#09090B]/90 backdrop-blur-xl border-b border-white/[0.06] z-20">
        {/* Left Section: Back button and Form Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/forms')}
            className="text-zinc-400 rounded-lg p-2 hover:bg-white/[0.06] hover:text-white transition-all"
          >
            <ArrowLeftIcon />
          </button>
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={() => {
                if (editedName.trim() && editedName !== formConfig.name) {
                  setFormConfig(prev => prev ? { ...prev, name: editedName.trim() } : null);
                  setHasUnsavedChanges(true);
                }
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (editedName.trim() && editedName !== formConfig.name) {
                    setFormConfig(prev => prev ? { ...prev, name: editedName.trim() } : null);
                    setHasUnsavedChanges(true);
                  }
                  setIsEditingName(false);
                } else if (e.key === 'Escape') {
                  setIsEditingName(false);
                }
              }}
              className="text-lg font-semibold text-white bg-[#18181B] border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-white focus:border-white min-w-[200px] transition-all"
              autoFocus
            />
          ) : (
            <div
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => {
                setEditedName(formConfig.name);
                setIsEditingName(true);
                setTimeout(() => nameInputRef.current?.focus(), 0);
              }}
            >
              <h1 className="text-lg font-semibold text-white font-heading">{formConfig.name}</h1>
              <button className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-white hover:scale-110">
                <EditIcon />
              </button>
            </div>
          )}
        </div>

        {/* Center Section: Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#0F0F11] rounded-xl p-1.5 border border-white/[0.06]">
          <NavItem
            icon={<SettingsIcon />}
            active={activeNavTab === 'settings'}
            onClick={() => setActiveNavTab('settings')}
          >
            Settings
          </NavItem>
          <NavItem
            icon={<FormIcon />}
            active={activeNavTab === 'form'}
            onClick={() => setActiveNavTab('form')}
          >
            Form
          </NavItem>
          <NavItem
            icon={<RewardIcon />}
            active={activeNavTab === 'rewards'}
            onClick={() => setActiveNavTab('rewards')}
          >
            Rewards
          </NavItem>
        </div>

        {/* Right Section: Preview and Save Buttons */}
        <div className="flex items-center gap-3">
          {/* Copy Link Button (Only visible when saved) */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors border border-transparent hover:border-white/10"
            onClick={handleCopyLink}
            title="Copy public link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border-white/10 text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/20 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 flex items-center gap-2"
            onClick={() => {
              setPreviewPageIndex(0);
              setIsPreviewMode(true);
            }}
          >
            <PreviewIcon className="w-4 h-4" />
            Preview
          </Button>
          <Button
            className="bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold py-2 px-5 rounded-lg text-sm transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: '0 0 20px rgba(191,255,0,0.15)' }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area with Smooth Transitions */}
        <AnimatePresence mode="wait">
          {activeNavTab === 'form' && (
            <motion.main
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 relative overflow-hidden bg-[#0F0F11]"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Main content area */}
              <div className="relative z-10 h-full w-full flex flex-col">
                {/* Card display area - uses EditorCardArea for proper context-aware navigation */}
                <FormDataProvider>
                  <EditorCardArea
                    formConfig={formConfig}
                    currentPageIndex={currentPageIndex}
                    setCurrentPageIndex={setCurrentPageIndex}
                    onFieldFocus={handleFieldFocus}
                  />
                </FormDataProvider>
              </div>
            </motion.main>
          )}

          {/* Settings Tab Content */}
          {activeNavTab === 'settings' && (
            <motion.main
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 relative overflow-hidden bg-[#0F0F11]"
            >
              <div className="relative z-10 h-full w-full flex justify-center pt-8 pb-12 px-12 overflow-y-auto scrollbar-hide">
                <GlobalSettingsPanel
                  formConfig={formConfig}
                  setFormConfig={setFormConfig}
                  defaultTheme={defaultTheme}
                  onConfigChange={() => setHasUnsavedChanges(true)}
                />
              </div>
            </motion.main>
          )}

          {/* Rewards Tab Content */}
          {activeNavTab === 'rewards' && (
            <motion.main
              key="rewards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 relative overflow-y-auto bg-[#0F0F11]"
            >
              <div className="relative z-10 w-full max-w-3xl mx-auto p-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                      <RewardIcon className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-heading tracking-tight">Rewards & Incentives</h2>
                      <p className="text-zinc-400 text-sm">Motivate users to leave testimonials with rewards</p>
                    </div>
                  </div>
                </motion.div>

                {/* Main Enable Toggle Card */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="bg-[#0F0F11] border border-white/[0.06] rounded-2xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formConfig?.rewards?.enabled ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-zinc-800/50 border border-white/10'}`}>
                        <svg className={`w-5 h-5 transition-colors ${formConfig?.rewards?.enabled ? 'text-emerald-400' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Enable Coupon Rewards</h3>
                        <p className="text-xs text-zinc-500">Show a reward coupon after testimonial submission</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFormConfig(prev => prev ? {
                          ...prev,
                          rewards: {
                            enabled: !prev.rewards?.enabled,
                            couponCode: prev.rewards?.couponCode || 'THANKYOU20',
                            description: prev.rewards?.description || 'Use this code for 20% off your next order!',
                            eligibleTypes: prev.rewards?.eligibleTypes || 'all',
                            expiryMessage: prev.rewards?.expiryMessage || '',
                          }
                        } : prev);
                        setHasUnsavedChanges(true);
                      }}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formConfig?.rewards?.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md ${formConfig?.rewards?.enabled ? 'left-6' : 'left-0.5'}`}
                      />
                    </button>
                  </div>
                </motion.section>

                {/* Settings (only show if enabled) */}
                <AnimatePresence>
                  {formConfig?.rewards?.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Coupon Code */}
                      <section
                        className="bg-[#0F0F11] border border-white/[0.06] rounded-2xl overflow-hidden"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                      >
                        <div className="p-5 border-b border-white/[0.06]">
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            Coupon Code
                          </h3>
                        </div>
                        <div className="p-5">
                          <input
                            type="text"
                            value={formConfig?.rewards?.couponCode || ''}
                            onChange={(e) => {
                              setFormConfig(prev => prev ? {
                                ...prev,
                                rewards: { ...prev.rewards!, couponCode: e.target.value.toUpperCase() }
                              } : prev);
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="THANKYOU20"
                            className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-mono tracking-wider placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                          />
                          <p className="text-xs text-zinc-500 mt-2">This is the code users will see and can copy</p>
                        </div>
                      </section>

                      {/* Reward Message */}
                      <section
                        className="bg-[#0F0F11] border border-white/[0.06] rounded-2xl overflow-hidden"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                      >
                        <div className="p-5 border-b border-white/[0.06]">
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            Reward Details
                          </h3>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block">Description</label>
                            <input
                              type="text"
                              value={formConfig?.rewards?.description || ''}
                              onChange={(e) => {
                                setFormConfig(prev => prev ? {
                                  ...prev,
                                  rewards: { ...prev.rewards!, description: e.target.value }
                                } : prev);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Use this code for 20% off your next order!"
                              className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-zinc-500 mt-1.5">This text appears below the coupon code</p>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block">Expiry Message (optional)</label>
                            <input
                              type="text"
                              value={formConfig?.rewards?.expiryMessage || ''}
                              onChange={(e) => {
                                setFormConfig(prev => prev ? {
                                  ...prev,
                                  rewards: { ...prev.rewards!, expiryMessage: e.target.value }
                                } : prev);
                                setHasUnsavedChanges(true);
                              }}
                              placeholder="Valid until January 31, 2025"
                              className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </section>

                      {/* Eligibility Settings */}
                      <section
                        className="bg-[#0F0F11] border border-white/[0.06] rounded-2xl overflow-hidden"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                      >
                        <div className="p-5 border-b border-white/[0.06]">
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            Eligibility
                          </h3>
                        </div>
                        <div className="p-5">
                          <p className="text-xs text-zinc-400 mb-4">Who should receive this reward?</p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'all', label: 'All Testimonials', icon: '✨' },
                              { value: 'video', label: 'Video Only', icon: '🎥' },
                              { value: 'text', label: 'Text Only', icon: '✍️' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setFormConfig(prev => prev ? {
                                    ...prev,
                                    rewards: { ...prev.rewards!, eligibleTypes: option.value as 'all' | 'video' | 'text' }
                                  } : prev);
                                  setHasUnsavedChanges(true);
                                }}
                                className={`p-4 rounded-xl border transition-all duration-200 text-center ${formConfig?.rewards?.eligibleTypes === option.value
                                  ? 'bg-white/10 border-white/30 text-white'
                                  : 'bg-[#18181B] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300'
                                  }`}
                              >
                                <div className="text-2xl mb-2">{option.icon}</div>
                                <div className="text-xs font-medium">{option.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.main>
          )}
        </AnimatePresence>

        {/* PowerPoint-style thumbnail sidebar - Only show for Form tab */}
        <AnimatePresence>
          {activeNavTab === 'form' && (
            <motion.aside
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-96 flex-none flex flex-col bg-[#09090B] border-l border-white/[0.06]"
            >
              <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`flex items-center justify-center gap-2.5 px-4 py-5 text-center transition-all duration-200 ${activeTab === 'pages'
                    ? 'bg-white/[0.06]'
                    : 'bg-transparent hover:bg-white/[0.04]'
                    }`}
                >
                  <div className={`transition-all duration-200 ${activeTab === 'pages' ? 'scale-110' : ''}`}>
                    <PagesIcon className={activeTab === 'pages' ? 'text-white' : 'text-zinc-500'} />
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${activeTab === 'pages' ? 'text-white' : 'text-zinc-400'}`}>
                    Pages
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center justify-center gap-2.5 px-4 py-5 text-center transition-all duration-200 ${activeTab === 'edit'
                    ? 'bg-white/[0.06]'
                    : 'bg-transparent hover:bg-white/[0.04]'
                    }`}
                >
                  <div className={`transition-all duration-200 ${activeTab === 'edit' ? 'scale-110' : ''}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={activeTab === 'edit' ? 'text-white' : 'text-zinc-500'}
                    >
                      <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${activeTab === 'edit' ? 'text-white' : 'text-zinc-400'}`}>
                    Customize
                  </span>
                </button>
              </div>

              {activeTab === 'pages' && (
                <PagesPanel
                  blocks={formConfig.blocks}
                  enabledBlocks={enabledBlocks}
                  currentPageIndex={currentPageIndex}

                  onPageClick={handlePageClick}
                  onTogglePage={handleTogglePage}
                />
              )}

              {activeTab === 'edit' && (
                <FormBuilderEditPanel
                  focusedBlock={enabledBlocks[currentPageIndex] || null}
                  onUpdateBlock={handleUpdateBlock}
                  focusedField={focusedField}
                />
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewMode && formConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsPreviewMode(false);
            }}
            tabIndex={0}
            ref={(el) => el?.focus()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPreviewMode(false)}
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-[#18181B]/90 hover:bg-[#27272A] text-zinc-400 hover:text-white transition-all duration-200 border border-white/[0.08] backdrop-blur-sm"
              aria-label="Close preview"
            >
              <CloseIcon />
            </button>

            {/* Preview Content - Uses FormRenderer for unified behavior */}
            <div className="h-full w-full">
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="w-full h-full"
              >
                <FormRenderer
                  formConfig={formConfig}
                  isPreview={true}
                  onComplete={() => setIsPreviewMode(false)}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap in Suspense for useSearchParams
export default function FormBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090B] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-zinc-800 border-t-[#BFFF00] rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading form builder...</p>
        </div>
      </div>
    }>
      <FormBuilderPageContent />
    </Suspense>
  );
}
