"use client";

import React, { useState } from 'react';
import { AboutCompanyBlockConfig } from '@/types/form-config';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TypeIcon, MessageSquareIcon, ButtonIcon, ChevronDownIcon } from './icons';
import { EditField, SectionDivider, InfoCard } from './shared';
import { useAutoFocus } from './hooks';

interface AboutCompanyEditPanelProps {
    block: AboutCompanyBlockConfig;
    onUpdate: (blockId: string, updatedProps: Partial<AboutCompanyBlockConfig['props']>) => void;
    focusedField?: { blockId: string; fieldPath: string } | null;
}

// Building icon for company
const BuildingIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
    </svg>
);

// Globe icon for website
const GlobeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

// Briefcase icon for job title
const BriefcaseIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

// Image icon for logo
const ImageIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const AboutCompanyEditPanel: React.FC<AboutCompanyEditPanelProps> = ({ block, onUpdate, focusedField }) => {
    // Track which field sections are expanded
    const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

    // Refs for auto-focus
    const titleInputRef = React.useRef<HTMLInputElement>(null);
    const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
    const buttonTextInputRef = React.useRef<HTMLInputElement>(null);
    const companyNameLabelRef = React.useRef<HTMLInputElement>(null);
    const companyNamePlaceholderRef = React.useRef<HTMLInputElement>(null);
    const jobTitleLabelRef = React.useRef<HTMLInputElement>(null);
    const jobTitlePlaceholderRef = React.useRef<HTMLInputElement>(null);
    const companyWebsiteLabelRef = React.useRef<HTMLInputElement>(null);
    const companyWebsitePlaceholderRef = React.useRef<HTMLInputElement>(null);
    const companyLogoLabelRef = React.useRef<HTMLInputElement>(null);

    // Use custom hooks
    useAutoFocus(focusedField, block.id, {
        'props.title': titleInputRef,
        'props.description': descriptionInputRef,
        'props.buttonText': buttonTextInputRef,
        'props.fields.companyName.label': companyNameLabelRef,
        'props.fields.companyName.placeholder': companyNamePlaceholderRef,
        'props.fields.jobTitle.label': jobTitleLabelRef,
        'props.fields.jobTitle.placeholder': jobTitlePlaceholderRef,
        'props.fields.companyWebsite.label': companyWebsiteLabelRef,
        'props.fields.companyWebsite.placeholder': companyWebsitePlaceholderRef,
        'props.fields.companyLogo.label': companyLogoLabelRef,
    });

    const handlePropChange = (prop: keyof AboutCompanyBlockConfig['props'], value: unknown) => {
        onUpdate(block.id, { [prop]: value });
    };

    const handleFieldChange = (
        field: keyof AboutCompanyBlockConfig['props']['fields'],
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
    // hasPlaceholder indicates if this field type has a placeholder property
    const fieldConfigs = [
        { key: 'companyName', label: 'Company Name', icon: BuildingIcon, iconColor: 'blue', hasPlaceholder: true },
        { key: 'jobTitle', label: 'Job Title', icon: BriefcaseIcon, iconColor: 'emerald', hasPlaceholder: true },
        { key: 'companyWebsite', label: 'Company Website', icon: GlobeIcon, iconColor: 'violet', hasPlaceholder: true },
        { key: 'companyLogo', label: 'Company Logo', icon: ImageIcon, iconColor: 'pink', hasPlaceholder: false },
    ] as const;

    const getFieldRef = (key: string, type: 'label' | 'placeholder') => {
        if (type === 'label') {
            if (key === 'companyName') return companyNameLabelRef;
            if (key === 'jobTitle') return jobTitleLabelRef;
            if (key === 'companyWebsite') return companyWebsiteLabelRef;
            return companyLogoLabelRef;
        }
        if (key === 'companyName') return companyNamePlaceholderRef;
        if (key === 'jobTitle') return jobTitlePlaceholderRef;
        return companyWebsitePlaceholderRef;
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
                    placeholder="Tell us about your company"
                    inputRef={titleInputRef}
                />

                <EditField
                    id="description"
                    label="Description"
                    icon={<MessageSquareIcon />}
                    iconColorClass="cyan"
                    type="textarea"
                    rows={2}
                    value={block.props.description || 'Help us understand your business better.'}
                    onChange={(v) => handlePropChange('description', v)}
                    placeholder="Help us understand your business better..."
                    inputRef={descriptionInputRef}
                />
            </div>

            <SectionDivider label="COMPANY FIELDS" />

            {/* Form Fields Section */}
            <div className="space-y-3">
                {fieldConfigs.map(({ key, label, icon: Icon, iconColor, hasPlaceholder }) => {
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
                                        iconColor === 'blue' ? 'bg-blue-500/10' :
                                            iconColor === 'violet' ? 'bg-violet-500/10' : 'bg-pink-500/10'
                                        }`}>
                                        <Icon className={`w-3 h-3 ${iconColor === 'emerald' ? 'text-emerald-400' :
                                            iconColor === 'blue' ? 'text-blue-400' :
                                                iconColor === 'violet' ? 'text-violet-400' : 'text-pink-400'
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
                                    onCheckedChange={(checked) => handleFieldChange(key as keyof AboutCompanyBlockConfig['props']['fields'], 'enabled', checked)}
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
                                            onChange={(e) => handleFieldChange(key as keyof AboutCompanyBlockConfig['props']['fields'], 'required', e.target.checked)}
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
                                            onChange={(e) => handleFieldChange(key as keyof AboutCompanyBlockConfig['props']['fields'], 'label', e.target.value)}
                                            placeholder="Field label"
                                            className="bg-gray-900/50 border-gray-700 text-white text-sm h-9"
                                        />
                                    </div>

                                    {/* Placeholder Input (only for fields that have placeholder) */}
                                    {hasPlaceholder && 'placeholder' in field && (
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1.5 block">Placeholder</label>
                                            <Input
                                                ref={getFieldRef(key, 'placeholder')}
                                                value={(field as { placeholder?: string }).placeholder || ''}
                                                onChange={(e) => handleFieldChange(key as keyof AboutCompanyBlockConfig['props']['fields'], 'placeholder', e.target.value)}
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
                icon={<BuildingIcon className="w-4 h-4 text-blue-400" />}
                iconColorClass="blue"
                title="Company Information"
                description="Collect company name, job title, website, and logo to add credibility to testimonials."
            />
        </div>
    );
};

export default AboutCompanyEditPanel;
