import React from 'react';

/**
 * A mapping of field paths to their corresponding refs.
 * Example: { 'props.title': titleInputRef, 'props.description': descriptionInputRef }
 */
export type FieldRefMap = Record<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>>;

interface FocusedField {
    blockId: string;
    fieldPath: string;
}

/**
 * Custom hook that handles auto-focusing input fields when `focusedField` changes.
 * Only triggers focus/select when the focused field actually changes, not on every render.
 * 
 * @param focusedField - The currently focused field object (blockId + fieldPath)
 * @param blockId - The ID of the current block
 * @param fieldRefMap - A mapping of field paths to their React refs
 * 
 * @example
 * ```tsx
 * const titleInputRef = React.useRef<HTMLInputElement>(null);
 * const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);
 * 
 * useAutoFocus(focusedField, block.id, {
 *   'props.title': titleInputRef,
 *   'props.description': descriptionInputRef,
 * });
 * ```
 */
export function useAutoFocus(
    focusedField: FocusedField | null | undefined,
    blockId: string,
    fieldRefMap: FieldRefMap
): void {
    // Store fieldRefMap in a ref so it doesn't cause effect re-runs
    const fieldRefMapRef = React.useRef(fieldRefMap);
    fieldRefMapRef.current = fieldRefMap;

    // Track the last focused field to prevent re-selecting on every render
    const lastFocusedRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        // Early return if no focused field or not for this block
        if (!focusedField || focusedField.blockId !== blockId) {
            lastFocusedRef.current = null;
            return;
        }

        const fieldPath = focusedField.fieldPath;
        const focusKey = `${focusedField.blockId}:${fieldPath}`;

        // Only focus if this is a NEW focus request (not the same field)
        if (lastFocusedRef.current === focusKey) {
            return;
        }

        lastFocusedRef.current = focusKey;

        const inputRef = fieldRefMapRef.current[fieldPath];

        if (inputRef?.current) {
            inputRef.current.focus();
            // Select text only for input elements (not textareas, to preserve cursor position)
            if (inputRef.current instanceof HTMLInputElement) {
                inputRef.current.select();
            }
        }
    }, [focusedField, blockId]); // Removed fieldRefMap from dependencies
}
