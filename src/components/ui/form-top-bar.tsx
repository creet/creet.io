import React from 'react';
import ContentContainer from '@/components/ui/content-container';
import Logo from '@/components/ui/Logo';

type FormTopBarProps = {
  onBack: () => void;
};

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const FormTopBar: React.FC<FormTopBarProps> = ({ onBack }) => {
  return (
    <ContentContainer className="pt-4 pb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="p-2 rounded-full text-gray-400/50 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 transition-colors"
        >
          <ArrowLeftIcon />
        </button>
        <Logo size={20} className="w-5 h-5 opacity-70" />
      </div>
    </ContentContainer>
  );
};

export default FormTopBar;
