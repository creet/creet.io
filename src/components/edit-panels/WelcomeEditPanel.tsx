"use client";

import React from 'react';
import { WelcomeBlockConfig } from '@/types/form-config';
import { TypeIcon, MessageSquareIcon, SparklesIcon, ClockIcon, ShieldCheckIcon } from './icons';
import { EditField, SectionDivider } from './shared';

interface WelcomeEditPanelProps {
  block: WelcomeBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<WelcomeBlockConfig['props']>) => void;
}

const WelcomeEditPanel: React.FC<WelcomeEditPanelProps> = ({ block, onUpdate }) => {
  const handlePropChange = (prop: keyof WelcomeBlockConfig['props'], value: string) => {
    onUpdate(block.id, { [prop]: value });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Page Title"
          icon={<TypeIcon />}
          iconColorClass="purple"
          value={block.props.title || ''}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="Leave us a testimonial"
        />

        <EditField
          id="description"
          label="Subtitle"
          icon={<MessageSquareIcon />}
          iconColorClass="blue"
          type="textarea"
          rows={4}
          value={block.props.description || ''}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="Testimonials help me grow my business. They're the best way of helping me out if you read and enjoy my work."
        />

        <EditField
          id="buttonText"
          label="Button Text"
          icon={<SparklesIcon />}
          iconColorClass="green"
          value={block.props.buttonText || ''}
          onChange={(v) => handlePropChange('buttonText', v)}
          placeholder="Continue"
        />
      </div>

      <SectionDivider label="ADDITIONAL MESSAGES" />

      {/* Additional Messages Section */}
      <div className="space-y-6">
        <EditField
          id="timingMessage"
          label="Time Estimate"
          icon={<ClockIcon />}
          iconColorClass="orange"
          value={block.props.timingMessage ?? 'Takes less than 3 minutes'}
          onChange={(v) => handlePropChange('timingMessage', v)}
          placeholder="Takes less than 3 minutes"
        />

        <EditField
          id="consentMessage"
          label="Privacy Reassurance"
          icon={<ShieldCheckIcon />}
          iconColorClass="cyan"
          type="textarea"
          rows={2}
          value={block.props.consentMessage ?? "You control what's shared"}
          onChange={(v) => handlePropChange('consentMessage', v)}
          placeholder="You control what's shared"
          helperText="Builds trust about data control"
        />
      </div>
    </div>
  );
};

export default WelcomeEditPanel;
