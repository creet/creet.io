"use client";

import React, { useState } from 'react';
import { AboutYouBlockConfig } from '@/types/form-config';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TypeIcon, MessageSquareIcon, ButtonIcon, UserIcon, ChevronDownIcon } from './icons';
import { EditField, SectionDivider, InfoCard } from './shared';
import { useAutoFocus } from './hooks';

interface AboutYouEditPanelProps {
  block: AboutYouBlockConfig;
  onUpdate: (blockId: string, updatedProps: Partial<AboutYouBlockConfig['props']>) => void;
  focusedField?: { blockId: string; fieldPath: string } | null;
}

const AboutYouEditPanel: React.FC<AboutYouEditPanelProps> = ({ block, onUpdate, focusedField }) => {
  // Track which field sections are expanded
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  // Refs for auto-focus
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
  const buttonTextInputRef = React.useRef<HTMLInputElement>(null);
  const nameLabelRef = React.useRef<HTMLInputElement>(null);
  const namePlaceholderRef = React.useRef<HTMLInputElement>(null);
  const emailLabelRef = React.useRef<HTMLInputElement>(null);
  const emailPlaceholderRef = React.useRef<HTMLInputElement>(null);
  const avatarLabelRef = React.useRef<HTMLInputElement>(null);

  // Use custom hooks
  useAutoFocus(focusedField, block.id, {
    'props.title': titleInputRef,
    'props.description': descriptionInputRef,
    'props.buttonText': buttonTextInputRef,
    'props.fields.name.label': nameLabelRef,
    'props.fields.name.placeholder': namePlaceholderRef,
    'props.fields.email.label': emailLabelRef,
    'props.fields.email.placeholder': emailPlaceholderRef,
    'props.fields.avatar.label': avatarLabelRef,
  });

  const handlePropChange = (prop: keyof AboutYouBlockConfig['props'], value: unknown) => {
    onUpdate(block.id, { [prop]: value });
  };

  const handleFieldChange = (
    field: keyof AboutYouBlockConfig['props']['fields'],
    prop: string,
    value: string | boolean
  ) => {
    const updatedFields = {
      ...block.props.fields,
      [field]: {
        ...block.props.fields[field],
        [prop]: value,
      },
    };
    handlePropChange('fields', updatedFields);
  };

  const toggleExpanded = (fieldKey: string) => {
    setExpandedFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  // Field configuration for rendering
  const fieldConfigs = [
    { key: 'name', label: 'Name Field', iconColor: 'emerald', hasPlaceholder: true },
    { key: 'email', label: 'Email Field', iconColor: 'blue', hasPlaceholder: true },
    { key: 'avatar', label: 'Avatar Upload', iconColor: 'pink', hasPlaceholder: false },
  ] as const;

  const getFieldRef = (key: string, type: 'label' | 'placeholder') => {
    if (type === 'label') {
      if (key === 'name') return nameLabelRef;
      if (key === 'email') return emailLabelRef;
      return avatarLabelRef;
    }
    if (key === 'name') return namePlaceholderRef;
    return emailPlaceholderRef;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Content Section */}
      <div className="space-y-6">
        <EditField
          id="title"
          label="Title"
          icon={<TypeIcon />}
          iconColorClass="teal"
          value={block.props.title || ''}
          onChange={(v) => handlePropChange('title', v)}
          placeholder="Tell us about yourself"
          inputRef={titleInputRef}
        />

        <EditField
          id="description"
          label="Description"
          icon={<MessageSquareIcon />}
          iconColorClass="cyan"
          type="textarea"
          rows={2}
          value={block.props.description || 'Share a little more about yourself.'}
          onChange={(v) => handlePropChange('description', v)}
          placeholder="Share a little more about yourself..."
          inputRef={descriptionInputRef}
        />
      </div>

      <SectionDivider label="FORM FIELDS" />

      {/* Form Fields Section */}
      <div className="space-y-3">
        {fieldConfigs.map(({ key, label, iconColor, hasPlaceholder }) => {
          const field = block.props.fields[key as keyof typeof block.props.fields];
          const isExpanded = expandedFields[key] ?? false;
          const isEnabled = field.enabled;

          return (
            <div key={key} className="rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden">
              {/* Header Row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 flex-1">
                  {/* Expand/Collapse Button */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(key)}
                    className={`flex items-center justify-center w-6 h-6 rounded transition-all ${isEnabled ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'
                      }`}
                    disabled={!isEnabled}
                  >
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded && isEnabled ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Icon */}
                  <div className={`flex items-center justify-center w-5 h-5 rounded ${iconColor === 'emerald' ? 'bg-emerald-500/10' :
                    iconColor === 'blue' ? 'bg-blue-500/10' : 'bg-pink-500/10'
                    }`}>
                    <UserIcon className={`w-3 h-3 ${iconColor === 'emerald' ? 'text-emerald-400' :
                      iconColor === 'blue' ? 'text-blue-400' : 'text-pink-400'
                      }`} />
                  </div>

                  {/* Label with asterisk for required */}
                  <span className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-gray-500'}`}>
                    {label}{isEnabled && field.required && <span className="text-red-400 text-xs ml-0.5">*</span>}
                  </span>
                </div>

                {/* Enable/Disable Switch */}
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleFieldChange(key as keyof AboutYouBlockConfig['props']['fields'], 'enabled', checked)}
                  className="data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-gray-700 border border-gray-600"
                />
              </div>

              {/* Expandable Content */}
              {isEnabled && isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-800 space-y-3">
                  {/* Required Checkbox */}
                  <label className="flex items-center gap-1.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={field.required ?? false}
                      onChange={(e) => handleFieldChange(key as keyof AboutYouBlockConfig['props']['fields'], 'required', e.target.checked)}
                      className="w-3 h-3 rounded border-gray-600 bg-transparent text-teal-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-gray-500">Required</span>
                  </label>

                  {/* Label Input */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Label</label>
                    <Input
                      ref={getFieldRef(key, 'label')}
                      value={field.label}
                      onChange={(e) => handleFieldChange(key as keyof AboutYouBlockConfig['props']['fields'], 'label', e.target.value)}
                      placeholder="Field label"
                      className="bg-gray-900/50 border-gray-700 text-white text-sm h-9"
                    />
                  </div>

                  {/* Placeholder Input (if applicable) */}
                  {hasPlaceholder && 'placeholder' in field && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Placeholder</label>
                      <Input
                        ref={getFieldRef(key, 'placeholder')}
                        value={(field as { placeholder?: string }).placeholder || ''}
                        onChange={(e) => handleFieldChange(key as keyof AboutYouBlockConfig['props']['fields'], 'placeholder', e.target.value)}
                        placeholder="Placeholder text"
                        className="bg-gray-900/50 border-gray-700 text-white text-sm h-9"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionDivider label="BUTTON" />

      {/* Button Section */}
      <div className="space-y-6">
        <EditField
          id="buttonText"
          label="Button Text"
          icon={<ButtonIcon />}
          iconColorClass="emerald"
          value={block.props.buttonText || ''}
          onChange={(v) => handlePropChange('buttonText', v)}
          placeholder="Continue"
          inputRef={buttonTextInputRef}
        />
      </div>

      {/* Info Card */}
      <InfoCard
        icon={<UserIcon className="w-4 h-4 text-teal-400" />}
        iconColorClass="teal"
        title="Personalize Testimonials"
        description="Toggle fields on/off and mark them as required. Click the chevron to expand field settings."
      />
    </div>
  );
};

export default AboutYouEditPanel;
