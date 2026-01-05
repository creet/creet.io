"use client";

import React from 'react';
import { ConsentBlockConfig } from '@/types/form-config';
import { TypeIcon, MessageSquareIcon, ButtonIcon, ShieldIcon, GlobeIcon, LockIcon } from './icons';
import { EditField, SectionDivider, InfoCard } from './shared';
import { useAutoFocus, useBlockUpdate } from './hooks';

interface ConsentEditPanelProps {
  block: ConsentBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<ConsentBlockConfig['props']>) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const ConsentEditPanel: React.FC<ConsentEditPanelProps> = ({ block, onUpdate, focusedField }) => {
  // Refs for auto-focus
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
  const publicOptionTitleRef = React.useRef<HTMLInputElement>(null);
  const publicOptionDescriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const privateOptionTitleRef = React.useRef<HTMLInputElement>(null);
  const privateOptionDescriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const buttonTextInputRef = React.useRef<HTMLInputElement>(null);
  const trustNoteInputRef = React.useRef<HTMLInputElement>(null);

  // Use custom hooks
  useAutoFocus(focusedField, block.id, {
    'props.title': titleInputRef,
    'props.description': descriptionInputRef,
    'props.publicOptionTitle': publicOptionTitleRef,
    'props.publicOptionDescription': publicOptionDescriptionRef,
    'props.privateOptionTitle': privateOptionTitleRef,
    'props.privateOptionDescription': privateOptionDescriptionRef,
    'props.buttonText': buttonTextInputRef,
    'props.trustNote': trustNoteInputRef,
  });

  const handlePropChange = useBlockUpdate<ConsentBlockConfig['props']>(block.id, onUpdate);

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Title"
          icon={<TypeIcon />}
          iconColorClass="purple"
          value={block.props.title || "How can we share your testimonial?"}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="How can we share your testimonial?"
          inputRef={titleInputRef}
        />

        <EditField
          id="description"
          label="Description"
          icon={<MessageSquareIcon />}
          iconColorClass="violet"
          type="textarea"
          value={block.props.description || "Your feedback means the world to us. Please select how you'd like us to use your testimonial."}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="Your feedback means the world to us..."
          inputRef={descriptionInputRef}
        />
      </div>

      <SectionDivider label="PUBLIC USAGE OPTION" />

      {/* Public Option Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <GlobeIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-400">Share Publicly</p>
            <p className="text-xs text-gray-500">Displayed on website & social media</p>
          </div>
        </div>

        <EditField
          id="publicOptionTitle"
          label="Option Title"
          icon={<TypeIcon />}
          iconColorClass="purple"
          value={block.props.publicOptionTitle || "Share it publicly"}
          onChange={(v) => handlePropChange('publicOptionTitle', v)}
          placeholder="Share it publicly"
          inputRef={publicOptionTitleRef}
        />

        <EditField
          id="publicOptionDescription"
          label="Option Description"
          icon={<MessageSquareIcon />}
          iconColorClass="purple"
          type="textarea"
          value={block.props.publicOptionDescription || "Display on our website, social media, and marketing materials to inspire others."}
          onChange={(v) => handlePropChange('publicOptionDescription', v)}
          placeholder="Display on our website, social media, and marketing materials..."
          inputRef={publicOptionDescriptionRef}
        />
      </div>

      <SectionDivider label="PRIVATE USAGE OPTION" />

      {/* Private Option Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <LockIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-400">Keep Private</p>
            <p className="text-xs text-gray-500">Internal use only for improvements</p>
          </div>
        </div>

        <EditField
          id="privateOptionTitle"
          label="Option Title"
          icon={<TypeIcon />}
          iconColorClass="emerald"
          value={block.props.privateOptionTitle || "Keep it private"}
          onChange={(v) => handlePropChange('privateOptionTitle', v)}
          placeholder="Keep it private"
          inputRef={privateOptionTitleRef}
        />

        <EditField
          id="privateOptionDescription"
          label="Option Description"
          icon={<MessageSquareIcon />}
          iconColorClass="emerald"
          type="textarea"
          value={block.props.privateOptionDescription || "Only for internal use to help us improve. We won't share it publicly."}
          onChange={(v) => handlePropChange('privateOptionDescription', v)}
          placeholder="Only for internal use to help us improve..."
          inputRef={privateOptionDescriptionRef}
        />
      </div>

      <SectionDivider label="BUTTON & TRUST" />

      {/* Button and Trust Section */}
      <div className="space-y-6">
        <EditField
          id="buttonText"
          label="Button Text"
          icon={<ButtonIcon />}
          iconColorClass="fuchsia"
          value={block.props.buttonText || "Continue"}
          onChange={(v) => handlePropChange('buttonText', v)}
          placeholder="Continue"
          inputRef={buttonTextInputRef}
        />

        <EditField
          id="trustNote"
          label="Trust Note"
          icon={<ShieldIcon />}
          iconColorClass="emerald"
          value={block.props.trustNote || "Your privacy is important to us. We'll always respect your choice."}
          onChange={(v) => handlePropChange('trustNote', v)}
          placeholder="Your privacy is important to us..."
          inputRef={trustNoteInputRef}
        />
      </div>

      {/* Info Card */}
      <InfoCard
        icon={<ShieldIcon className="w-4 h-4 text-purple-400" />}
        iconColorClass="purple"
        title="Choice-Based Consent"
        description="Let users choose how their testimonial is used. They can opt for public display (website, social media) or private use (internal feedback only). This builds trust and respects their privacy preferences."
      />
    </div>
  );
};

export default ConsentEditPanel;
