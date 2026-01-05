"use client";

import React from 'react';
import { NegativeFeedbackBlockConfig } from '@/types/form-config';
import { Input } from '@/components/ui/input';
import { TypeIcon, MessageSquareIcon, ButtonIcon, HeartHandshakeIcon, LightbulbIcon, PlusIcon, XIcon } from './icons';
import { EditField, SectionDivider, InfoCard } from './shared';
import { useAutoFocus, useBlockUpdate } from './hooks';

// Default tips for constructive feedback
const DEFAULT_FEEDBACK_TIPS = [
  'Be specific about the issue you faced',
  'Describe what you expected to happen',
  'Let us know how we can improve',
];

interface NegativeFeedbackEditPanelProps {
  block: NegativeFeedbackBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<NegativeFeedbackBlockConfig['props']>) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const NegativeFeedbackEditPanel: React.FC<NegativeFeedbackEditPanelProps> = ({ block, onUpdate, focusedField }) => {
  // Refs for auto-focus
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
  const feedbackQuestionInputRef = React.useRef<HTMLInputElement>(null);
  const feedbackPlaceholderInputRef = React.useRef<HTMLInputElement>(null);
  const feedbackHelperTextInputRef = React.useRef<HTMLInputElement>(null);
  const buttonTextInputRef = React.useRef<HTMLInputElement>(null);

  // Get tips with default fallback
  const tips = block.props.tips || DEFAULT_FEEDBACK_TIPS;

  // Use custom hooks
  useAutoFocus(focusedField, block.id, {
    'props.title': titleInputRef,
    'props.description': descriptionInputRef,
    'props.feedbackQuestion': feedbackQuestionInputRef,
    'props.feedbackPlaceholder': feedbackPlaceholderInputRef,
    'props.feedbackHelperText': feedbackHelperTextInputRef,
    'props.buttonText': buttonTextInputRef,
  });

  const handlePropChange = useBlockUpdate<NegativeFeedbackBlockConfig['props']>(block.id, onUpdate);

  const handleAddTip = () => {
    handlePropChange('tips', [...tips, '']);
  };

  const handleUpdateTip = (index: number, value: string) => {
    const currentTips = [...tips];
    currentTips[index] = value;
    handlePropChange('tips', currentTips);
  };

  const handleRemoveTip = (index: number) => {
    const currentTips = [...tips];
    currentTips.splice(index, 1);
    handlePropChange('tips', currentTips);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Title"
          icon={<TypeIcon />}
          iconColorClass="orange"
          value={block.props.title || ''}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="What can we do better?"
          inputRef={titleInputRef}
        />

        <EditField
          id="description"
          label="Description"
          icon={<MessageSquareIcon />}
          iconColorClass="amber"
          type="textarea"
          value={block.props.description || ''}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="We're sorry to hear that. Please share your feedback..."
          inputRef={descriptionInputRef}
        />
      </div>

      <SectionDivider label="GUIDANCE TIPS" />

      {/* Tips Section - Similar to QuestionEditPanel */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 mb-2">
          These tips help users provide constructive feedback. They appear on the left panel.
        </p>
        {tips.map((tip, index) => (
          <div key={index} className="group flex items-center gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <Input
              type="text"
              value={tip}
              onChange={(e) => handleUpdateTip(index, e.target.value)}
              placeholder="Enter a tip..."
              className="flex-1 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:bg-gray-900 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 h-10 text-sm"
            />
            <button
              onClick={() => handleRemoveTip(index)}
              className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Remove tip"
            >
              <XIcon />
            </button>
          </div>
        ))}

        {/* Add Tip Button */}
        <button
          onClick={handleAddTip}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-900/30 transition-all duration-200"
        >
          <PlusIcon />
          <span className="text-sm font-medium">Add Tip</span>
        </button>
      </div>

      <SectionDivider label="FEEDBACK FORM TEXT" />

      {/* Feedback Form Texts */}
      <div className="space-y-6">
        <EditField
          id="feedbackQuestion"
          label="Feedback Question Label"
          icon={<TypeIcon />}
          iconColorClass="orange"
          value={block.props.feedbackQuestion || 'Could you please tell us more?'}
          onChange={(v) => handlePropChange('feedbackQuestion', v)}
          placeholder="Could you please tell us more?"
          inputRef={feedbackQuestionInputRef}
        />

        <EditField
          id="feedbackPlaceholder"
          label="Placeholder Text"
          icon={<MessageSquareIcon />}
          iconColorClass="amber"
          value={block.props.feedbackPlaceholder || 'Please share as much detail as possible...'}
          onChange={(v) => handlePropChange('feedbackPlaceholder', v)}
          placeholder="Please share as much detail as possible..."
          inputRef={feedbackPlaceholderInputRef}
        />

        <EditField
          id="feedbackHelperText"
          label="Helper Text"
          icon={<MessageSquareIcon />}
          iconColorClass="amber"
          value={block.props.feedbackHelperText || 'We value your feedback and review every submission carefully.'}
          onChange={(v) => handlePropChange('feedbackHelperText', v)}
          placeholder="We value your feedback..."
          inputRef={feedbackHelperTextInputRef}
        />
      </div>

      <SectionDivider label="BUTTON" />

      {/* Button Section */}
      <div className="space-y-6">
        <EditField
          id="buttonText"
          label="Button Text"
          icon={<ButtonIcon />}
          iconColorClass="rose"
          value={block.props.buttonText || ''}
          onChange={(v) => handlePropChange('buttonText', v)}
          placeholder="Submit Feedback"
          inputRef={buttonTextInputRef}
        />
      </div>

      {/* Info Card */}
      <InfoCard
        icon={<HeartHandshakeIcon className="w-4 h-4 text-orange-400" />}
        iconColorClass="orange"
        title="Feedback Matters"
        description="This page appears when users rate below a certain threshold. The tips on the left panel guide users to provide constructive feedback while the form on the right captures their input."
      />
    </div>
  );
};

export default NegativeFeedbackEditPanel;
