import React from 'react';

/**
 * Custom hook that provides a memoized update handler for block properties.
 * Reduces boilerplate for the common pattern of updating individual props.
 * 
 * @param blockId - The ID of the current block
 * @param onUpdate - The update callback function from parent
 * @returns A memoized handler function for updating individual properties
 * 
 * @example
 * ```tsx
 * const handlePropChange = useBlockUpdate(block.id, onUpdate);
 * 
 * // Usage:
 * handlePropChange('title', e.target.value);
 * handlePropChange('enabled', true);
 * ```
 */
export function useBlockUpdate<TProps extends Record<string, unknown>>(
    blockId: string,
    onUpdate: (blockId: string, updatedProps: Partial<TProps>) => void
): (prop: keyof TProps, value: TProps[keyof TProps]) => void {
    return React.useCallback(
        (prop: keyof TProps, value: TProps[keyof TProps]) => {
            onUpdate(blockId, { [prop]: value } as Partial<TProps>);
        },
        [blockId, onUpdate]
    );
}
