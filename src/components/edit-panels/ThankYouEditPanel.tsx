"use client";

import React from 'react';
import { ThankYouBlockConfig } from '@/types/form-config';
import { TypeIcon, MessageSquareIcon, ShareIcon, PartyPopperIcon, SparklesIcon } from './icons';
import { EditField, SectionDivider, InfoCard, ToggleCard } from './shared';
import { useAutoFocus, useBlockUpdate } from './hooks';

interface ThankYouEditPanelProps {
  block: ThankYouBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<ThankYouBlockConfig['props']>) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const ThankYouEditPanel: React.FC<ThankYouEditPanelProps> = ({ block, onUpdate, focusedField }) => {
  // Refs for auto-focus
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);

  // Use custom hooks
  useAutoFocus(focusedField, block.id, {
    'props.title': titleInputRef,
    'props.description': descriptionInputRef,
  });

  const handlePropChange = useBlockUpdate<ThankYouBlockConfig['props']>(block.id, onUpdate);

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Title"
          icon={<TypeIcon />}
          iconColorClass="green"
          value={block.props.title || ''}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="Thank you for your feedback!"
          inputRef={titleInputRef}
        />

        <EditField
          id="description"
          label="Description"
          icon={<MessageSquareIcon />}
          iconColorClass="emerald"
          type="textarea"
          value={block.props.description || ''}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="We appreciate you taking the time to share your thoughts..."
          inputRef={descriptionInputRef}
        />
      </div>

      <SectionDivider label="SOCIAL SHARING" />

      {/* Social Sharing Section */}
      <div className="space-y-4">
        <ToggleCard
          id="showSocials"
          icon={<ShareIcon />}
          iconColorClass="sky"
          title="Show Social Sharing"
          description="Let users share their testimonial on social media"
          checked={block.props.showSocials}
          onCheckedChange={(checked) => handlePropChange('showSocials', checked)}
        />

        <ToggleCard
          id="showAnimations"
          icon={<SparklesIcon />}
          iconColorClass="amber"
          title="Show Animations"
          description="Confetti, floating emojis, and celebratory effects"
          checked={block.props.showAnimations ?? true}
          onCheckedChange={(checked) => handlePropChange('showAnimations', checked)}
        />
      </div>

      {/* Info Card */}
      <InfoCard
        icon={<PartyPopperIcon className="w-4 h-4 text-green-400" />}
        iconColorClass="green"
        title="Celebrate & Share"
        description="This is the final page users see after submitting their testimonial. Enable social sharing to encourage them to spread the word!"
      />
    </div>
  );
};

export default ThankYouEditPanel;
