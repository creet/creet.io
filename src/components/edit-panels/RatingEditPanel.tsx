"use client";

import React from 'react';
import { RatingBlockConfig } from '@/types/form-config';
import { StarIcon, MessageSquareIcon, SparklesIcon } from './icons';
import { EditField, InfoCard } from './shared';

interface RatingEditPanelProps {
  block: RatingBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<RatingBlockConfig['props']>) => void;
}

const RatingEditPanel: React.FC<RatingEditPanelProps> = ({ block, onUpdate }) => {
  const handlePropChange = (prop: keyof RatingBlockConfig['props'], value: string) => {
    onUpdate(block.id, { [prop]: value });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Rating Question"
          icon={<StarIcon />}
          iconColorClass="yellow"
          value={block.props.title || ''}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="How would you rate your experience?"
        />

        <EditField
          id="description"
          label="Supporting Text"
          icon={<MessageSquareIcon />}
          iconColorClass="blue"
          type="textarea"
          value={block.props.description || ''}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="Your feedback helps us improve our service"
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

      {/* Info Card */}
      <InfoCard
        icon={<StarIcon className="w-4 h-4 text-yellow-400" />}
        iconColorClass="yellow"
        title="Star Rating"
        description="Users will rate their experience using a 5-star scale with interactive feedback labels."
      />
    </div>
  );
};

export default RatingEditPanel;
