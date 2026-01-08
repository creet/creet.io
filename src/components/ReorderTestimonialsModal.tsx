"use client";

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Video, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================================= //
//                              TYPES                                //
// ================================================================= //

export interface SimpleTestimonial {
    id: string;
    author_name: string;
    author_avatar_url?: string | null;
    content?: string;
    text?: string;
    type?: 'text' | 'video';
    rating?: number | null;
}

interface ReorderTestimonialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    testimonials: SimpleTestimonial[];
    onSaveOrder: (orderedIds: string[]) => void;
}

// ================================================================= //
//                        SORTABLE ITEM                              //
// ================================================================= //

function SortableItem({ testimonial }: { testimonial: SimpleTestimonial }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: testimonial.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const displayText = testimonial.content || testimonial.text || '';
    const truncatedText = displayText.length > 80
        ? displayText.substring(0, 80) + '...'
        : displayText;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl transition-all cursor-grab active:cursor-grabbing touch-none select-none",
                isDragging && "shadow-lg shadow-black/30 border-violet-500/50 bg-zinc-800 z-50"
            )}
        >
            {/* Drag Handle Visual */}
            <div className="shrink-0 text-zinc-500">
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Avatar */}
            <div className="shrink-0">
                {testimonial.author_avatar_url ? (
                    <img
                        src={testimonial.author_avatar_url}
                        alt={testimonial.author_name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-600"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                        {testimonial.author_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 text-sm truncate">
                        {testimonial.author_name || 'Anonymous'}
                    </span>
                    {testimonial.type === 'video' && (
                        <Video className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    )}
                    {testimonial.rating && testimonial.rating > 0 && (
                        <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-zinc-400">{testimonial.rating}</span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {truncatedText || 'No content'}
                </p>
            </div>
        </div>
    );
}

// ================================================================= //
//                         MAIN COMPONENT                            //
// ================================================================= //

export function ReorderTestimonialsModal({
    isOpen,
    onClose,
    testimonials,
    onSaveOrder,
}: ReorderTestimonialsModalProps) {
    const [items, setItems] = useState<SimpleTestimonial[]>(testimonials);

    // Update items when testimonials prop changes
    React.useEffect(() => {
        setItems(testimonials);
    }, [testimonials]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = () => {
        const orderedIds = items.map((item) => item.id);
        onSaveOrder(orderedIds);
        onClose();
    };

    const handleCancel = () => {
        setItems(testimonials); // Reset to original order
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Reorder Testimonials
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Drag items to change display order
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sortable List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {items.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            No testimonials to reorder
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items.map((item) => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((testimonial) => (
                                    <SortableItem
                                        key={testimonial.id}
                                        testimonial={testimonial}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                    >
                        Save Order
                    </button>
                </div>
            </div>
        </div>
    );
}
