"use client";

import React from 'react';
import { PrivateFeedbackBlockConfig } from '@/types/form-config';
import { TypeIcon, MessageSquareIcon, ButtonIcon, LockIcon, PenIcon } from './icons';
import { EditField, SectionDivider, InfoCard } from './shared';
import { useAutoFocus, useBlockUpdate } from './hooks';

interface PrivateFeedbackEditPanelProps {
  block: PrivateFeedbackBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<PrivateFeedbackBlockConfig['props']>) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const PrivateFeedbackEditPanel: React.FC<PrivateFeedbackEditPanelProps> = ({ block, onUpdate, focusedField }) => {
  // Refs for auto-focus
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
  const placeholderInputRef = React.useRef<HTMLInputElement>(null);
  const buttonTextInputRef = React.useRef<HTMLInputElement>(null);

  // Use custom hooks
  useAutoFocus(focusedField, block.id, {
    'props.title': titleInputRef,
    'props.description': descriptionInputRef,
    'props.placeholder': placeholderInputRef,
    'props.buttonText': buttonTextInputRef,
  });

  const handlePropChange = useBlockUpdate<PrivateFeedbackBlockConfig['props']>(block.id, onUpdate);

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Title"
          icon={<TypeIcon />}
          iconColorClass="blue"
          value={block.props.title || ''}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="Would you like to send us private feedback?"
          inputRef={titleInputRef}
        />

        <EditField
          id="description"
          label="Description"
          icon={<MessageSquareIcon />}
          iconColorClass="cyan"
          type="textarea"
          value={block.props.description || 'Your feedback helps us improve. This stays private and will not be published.'}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="Your feedback helps us improve. This stays private and will not be published."
          inputRef={descriptionInputRef}
        />
      </div>

      <SectionDivider label="FEEDBACK INPUT" />

      {/* Feedback Input Section */}
      <div className="space-y-6">
        <EditField
          id="placeholder"
          label="Placeholder Text"
          icon={<PenIcon />}
          iconColorClass="sky"
          value={block.props.placeholder || ''}
          onChange={(v) => handlePropChange('placeholder', v)}
          placeholder="Type your message..."
          inputRef={placeholderInputRef}
        />
      </div>

      <SectionDivider label="BUTTON" />

      {/* Button Section */}
      <div className="space-y-6">
        <EditField
          id="buttonText"
          label="Button Text"
          icon={<ButtonIcon />}
          iconColorClass="indigo"
          value={block.props.buttonText || ''}
          onChange={(v) => handlePropChange('buttonText', v)}
          placeholder="Send Private Feedback"
          inputRef={buttonTextInputRef}
        />
      </div>

      {/* Info Card */}
      <InfoCard
        icon={<LockIcon className="w-4 h-4 text-blue-400" />}
        iconColorClass="blue"
        title="Private & Confidential"
        description="This page allows users to share feedback privately. Use it to collect honest feedback that won't be published publicly."
      />
    </div>
  );
};

export default PrivateFeedbackEditPanel;
