import React from 'react';
import { FormBlock, FormBlockType, FormConfig } from '@/types/form-config';

// Import placeholder Edit Panels (we will create these next)
import WelcomeEditPanel from './WelcomeEditPanel';
import RatingEditPanel from './RatingEditPanel';
import QuestionEditPanel from './QuestionEditPanel';
import NegativeFeedbackEditPanel from './NegativeFeedbackEditPanel';
import PrivateFeedbackEditPanel from './PrivateFeedbackEditPanel';
import ConsentEditPanel from './ConsentEditPanel';
import AboutYouEditPanel from './AboutYouEditPanel';
import AboutCompanyEditPanel from './AboutCompanyEditPanel';
import ReadyToSendEditPanel from './ReadyToSendEditPanel';
import ThankYouEditPanel from './ThankYouEditPanel';

interface FormBuilderEditPanelProps {
  focusedBlock: FormBlock | null;
  onUpdateBlock: (blockId: string, updatedProps: any) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const FormBuilderEditPanel: React.FC<FormBuilderEditPanelProps> = ({ focusedBlock, onUpdateBlock, focusedField }) => {
  if (!focusedBlock) {
    return (
      <div className="text-center text-zinc-500 pt-12">
        <p>Select a page or an element to see editing options.</p>
      </div>
    );
  }

  const renderPanel = () => {
    switch (focusedBlock.type) {
      case FormBlockType.Welcome:
        return <WelcomeEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} />;
      case FormBlockType.Rating:
        return <RatingEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} />;
      case FormBlockType.Question:
        return <QuestionEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      case FormBlockType.NegativeFeedback:
        return <NegativeFeedbackEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      case FormBlockType.PrivateFeedback:
        return <PrivateFeedbackEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      case FormBlockType.Consent:
        return <ConsentEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      case FormBlockType.AboutYou:
        return <AboutYouEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      case FormBlockType.AboutCompany:
        return <AboutCompanyEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      case FormBlockType.ReadyToSend:
        return <ReadyToSendEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} />;
      case FormBlockType.ThankYou:
        return <ThankYouEditPanel block={focusedBlock as any} onUpdate={onUpdateBlock} focusedField={focusedField} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  const getPageTitle = (type: FormBlockType) => {
    const titles: Record<FormBlockType, string> = {
      [FormBlockType.Welcome]: 'Welcome page',
      [FormBlockType.Rating]: 'Rating page',
      [FormBlockType.Question]: 'Question page',
      [FormBlockType.NegativeFeedback]: 'Negative feedback page',
      [FormBlockType.PrivateFeedback]: 'Private feedback page',
      [FormBlockType.Consent]: 'Consent page',
      [FormBlockType.AboutYou]: 'About you page',
      [FormBlockType.AboutCompany]: 'About company page',
      [FormBlockType.ReadyToSend]: 'Ready to send page',
      [FormBlockType.ThankYou]: 'Thank you page',
    };
    return titles[type] || type;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex-none">
        <h3 className="text-base font-medium text-zinc-200">
          {getPageTitle(focusedBlock.type)}
        </h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto px-6 pt-6 pb-16">
        {renderPanel()}
      </div>
    </div>
  );
};

export default FormBuilderEditPanel;
