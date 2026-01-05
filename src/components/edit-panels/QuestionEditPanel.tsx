"use client";

import React from 'react';
import { QuestionBlockConfig } from '@/types/form-config';
import { DEFAULT_TESTIMONIAL_TIPS } from '@/lib/default-form-config';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TypeIcon, MessageSquareIcon, VideoIcon, PenIcon, LightbulbIcon, PlusIcon, XIcon } from './icons';
import { EditField, SectionDivider, InfoCard } from './shared';
import { useAutoFocus } from './hooks';

interface QuestionEditPanelProps {
  block: QuestionBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<QuestionBlockConfig['props']>) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const QuestionEditPanel: React.FC<QuestionEditPanelProps> = ({ block, onUpdate, focusedField }) => {
  // Refs for inputs to enable auto-focus
  const questionInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
  const videoTitleInputRef = React.useRef<HTMLInputElement>(null);
  const videoDescInputRef = React.useRef<HTMLInputElement>(null);
  const textTitleInputRef = React.useRef<HTMLInputElement>(null);
  const textDescInputRef = React.useRef<HTMLInputElement>(null);

  // Provide defaults if props don't exist yet
  const enableVideoTestimonial = block.props.enableVideoTestimonial ?? true;
  const enableTextTestimonial = block.props.enableTextTestimonial ?? true;
  const tips = block.props.tips || DEFAULT_TESTIMONIAL_TIPS;

  // Use custom hooks
  useAutoFocus(focusedField, block.id, {
    'props.question': questionInputRef,
    'props.description': descriptionInputRef,
    'props.videoOptionTitle': videoTitleInputRef,
    'props.videoOptionDescription': videoDescInputRef,
    'props.textOptionTitle': textTitleInputRef,
    'props.textOptionDescription': textDescInputRef,
  });

  const handlePropChange = (prop: keyof QuestionBlockConfig['props'], value: string | boolean | string[]) => {
    onUpdate(block.id, { [prop]: value });
  };

  const handleToggleVideo = (checked: boolean) => {
    // Ensure at least one testimonial type is enabled
    if (!checked && !enableTextTestimonial) {
      return; // Can't disable video if text is already disabled
    }
    handlePropChange('enableVideoTestimonial', checked);
  };

  const handleToggleText = (checked: boolean) => {
    // Ensure at least one testimonial type is enabled
    if (!checked && !enableVideoTestimonial) {
      return; // Can't disable text if video is already disabled
    }
    handlePropChange('enableTextTestimonial', checked);
  };

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
          id="question"
          label="Question"
          icon={<TypeIcon />}
          iconColorClass="purple"
          value={block.props.question || ''}
          onChange={(v) => handlePropChange('question', v)}
          placeholder="What made you choose us?"
          inputRef={questionInputRef}
        />

        <EditField
          id="description"
          label="Supporting Text"
          icon={<MessageSquareIcon />}
          iconColorClass="blue"
          type="textarea"
          value={block.props.description || ''}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="Share your experience with us..."
          inputRef={descriptionInputRef}
        />
      </div>

      <SectionDivider label="TESTIMONIAL TYPE" />

      {/* Testimonial Type Toggles */}
      <div className="space-y-4">
        {/* Video Testimonial Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400">
              <VideoIcon />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">Video Testimonial</span>
              <span className="text-xs text-gray-500">Allow users to record video</span>
            </div>
          </label>
          <Switch
            checked={enableVideoTestimonial}
            onCheckedChange={handleToggleVideo}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        {/* Text Testimonial Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-lime-500/10 text-lime-400">
              <PenIcon />
            </div>
            <div>
              <span className="text-sm font-medium text-white block">Text Testimonial</span>
              <span className="text-xs text-gray-500">Allow users to write text</span>
            </div>
          </label>
          <Switch
            checked={enableTextTestimonial}
            onCheckedChange={handleToggleText}
            className="data-[state=checked]:bg-lime-600"
          />
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500 text-center">
          At least one testimonial type must be enabled
        </p>
      </div>

      {/* Video Option Labels - Only show if video is enabled */}
      {enableVideoTestimonial && (
        <>
          <SectionDivider label="VIDEO OPTION LABELS" />

          <div className="space-y-6">
            <EditField
              id="videoOptionTitle"
              label="Video Option Title"
              icon={<VideoIcon />}
              iconColorClass="purple"
              value={block.props.videoOptionTitle || 'Record a video'}
              onChange={(v) => handlePropChange('videoOptionTitle', v)}
              placeholder="Record a video"
              inputRef={videoTitleInputRef}
            />

            <EditField
              id="videoOptionDescription"
              label="Video Option Description"
              icon={<MessageSquareIcon />}
              iconColorClass="purple"
              value={block.props.videoOptionDescription || '2-minute video testimonial'}
              onChange={(v) => handlePropChange('videoOptionDescription', v)}
              placeholder="2-minute video testimonial"
              inputRef={videoDescInputRef}
            />
          </div>
        </>
      )}

      {/* Text Option Labels - Only show if text is enabled */}
      {enableTextTestimonial && (
        <>
          <SectionDivider label="TEXT OPTION LABELS" />

          <div className="space-y-6">
            <EditField
              id="textOptionTitle"
              label="Text Option Title"
              icon={<PenIcon />}
              iconColorClass="green"
              value={block.props.textOptionTitle || 'Write your story'}
              onChange={(v) => handlePropChange('textOptionTitle', v)}
              placeholder="Write your story"
              inputRef={textTitleInputRef}
            />

            <EditField
              id="textOptionDescription"
              label="Text Option Description"
              icon={<MessageSquareIcon />}
              iconColorClass="green"
              value={block.props.textOptionDescription || 'Text testimonial'}
              onChange={(v) => handlePropChange('textOptionDescription', v)}
              placeholder="Text testimonial"
              inputRef={textDescInputRef}
            />
          </div>
        </>
      )}

      <SectionDivider label="TIPS FOR GREAT TESTIMONIALS" />

      {/* Tips Section */}
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="group flex items-center gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <Input
              type="text"
              value={tip}
              onChange={(e) => handleUpdateTip(index, e.target.value)}
              placeholder="Enter a tip..."
              className="flex-1 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600 focus:bg-gray-900 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 h-10 text-sm"
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

      {/* Info Card */}
      <InfoCard
        icon={<LightbulbIcon className="w-4 h-4 text-amber-400" />}
        iconColorClass="amber"
        title="Tip Guidance"
        description="Tips help users provide better, more specific testimonials. Each tip will be displayed with a checkmark icon."
      />
    </div>
  );
};

export default QuestionEditPanel;
