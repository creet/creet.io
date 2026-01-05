"use client";

import { X, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BulkActionsFloatingBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onMakePublic: () => void;
    onMakeHidden: () => void;
    onDelete: () => void;
}

export function BulkActionsFloatingBar({
    selectedCount,
    onClearSelection,
    onMakePublic,
    onMakeHidden,
    onDelete
}: BulkActionsFloatingBarProps) {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, mass: 1 }}
                    className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw]"
                >
                    <div className="bg-[#121214] border border-zinc-700/60 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl p-2 flex items-center gap-3 md:gap-4 ring-1 ring-white/10 backdrop-blur-2xl">
                        <div className="flex items-center gap-3 pl-3 border-r border-zinc-800 pr-4 py-1">
                            <span className="text-zinc-300 text-xs font-medium whitespace-nowrap">
                                Bulk update <span className="text-white font-bold ml-1 text-sm">{selectedCount}</span>
                            </span>
                            <button
                                onClick={onClearSelection}
                                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-700/50"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pr-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMakeHidden}
                                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 hover:text-white h-9 gap-2 text-xs font-semibold whitespace-nowrap border border-zinc-700/50 rounded-lg px-3 shadow-sm"
                            >
                                <EyeOff className="size-4 text-zinc-400 group-hover:text-zinc-200" />
                                Make Hidden
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMakePublic}
                                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 h-9 gap-2 text-xs font-semibold whitespace-nowrap border border-emerald-500/20 rounded-lg px-3 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]"
                            >
                                <Eye className="size-4" />
                                Make Public
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-200 h-9 gap-2 text-xs font-semibold whitespace-nowrap border border-red-500/20 rounded-lg px-3 shadow-[0_0_15px_-5px_rgba(239,68,68,0.2)]"
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
