"use client";

import React from 'react';
import { ReadyToSendBlockConfig } from '@/types/form-config';
import { RocketIcon, MessageSquareIcon, SendIcon, SparklesIcon } from './icons';
import { EditField, InfoCard } from './shared';
import { useAutoFocus, useBlockUpdate } from './hooks';

interface ReadyToSendEditPanelProps {
    block: ReadyToSendBlockConfig;
    onUpdate: (blockId: string, updatedProps: Partial<ReadyToSendBlockConfig['props']>) => void;
    focusedField?: { blockId: string; fieldPath: string } | null;
}

const ReadyToSendEditPanel: React.FC<ReadyToSendEditPanelProps> = ({ block, onUpdate, focusedField }) => {
    // Refs for auto-focus
    const titleInputRef = React.useRef<HTMLInputElement>(null);
    const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
    const buttonTextInputRef = React.useRef<HTMLInputElement>(null);

    // Use custom hooks
    useAutoFocus(focusedField, block.id, {
        'props.title': titleInputRef,
        'props.description': descriptionInputRef,
        'props.buttonText': buttonTextInputRef,
    });

    const handlePropChange = useBlockUpdate<ReadyToSendBlockConfig['props']>(block.id, onUpdate);

    return (
        <div className="flex flex-col gap-8">
            {/* Content Section */}
            <div className="space-y-6">
                <EditField
                    id="title"
                    label="Title"
                    icon={<RocketIcon />}
                    iconColorClass="emerald"
                    value={block.props.title || ''}
                    onChange={(v) => handlePropChange('title', v)}
                    placeholder="Ready to send?"
                    inputRef={titleInputRef}
                />

                <EditField
                    id="description"
                    label="Description"
                    icon={<MessageSquareIcon />}
                    iconColorClass="green"
                    type="textarea"
                    value={block.props.description || ''}
                    onChange={(v) => handlePropChange('description', v)}
                    placeholder="Thank you for your valuable feedback!"
                    inputRef={descriptionInputRef}
                />

                <EditField
                    id="buttonText"
                    label="Button Text"
                    icon={<SendIcon />}
                    iconColorClass="teal"
                    value={block.props.buttonText || ''}
                    onChange={(v) => handlePropChange('buttonText', v)}
                    placeholder="Submit Testimonial"
                    inputRef={buttonTextInputRef}
                />
            </div>

            {/* Info Card */}
            <InfoCard
                icon={<SparklesIcon className="w-4 h-4 text-emerald-400" />}
                iconColorClass="emerald"
                title="Preview & Confirm"
                description="This page gives users a final preview of their testimonial before submission. It builds confidence and reduces accidental submissions."
            />
        </div>
    );
};

export default ReadyToSendEditPanel;
