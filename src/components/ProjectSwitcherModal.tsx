"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createProject, switchProject } from "@/lib/actions/projects";

type ProjectSummary = {
    id: string;
    name: string | null;
    brand_settings?: any;
};

type ProjectSwitcherModalProps = {
    isOpen: boolean;
    onClose: () => void;
    projects: ProjectSummary[];
    activeProjectId: string | null;
};

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.08)',
    glowLime: '0 0 20px rgba(191,255,0,0.15)',
};

export default function ProjectSwitcherModal({
    isOpen,
    onClose,
    projects,
    activeProjectId,
}: ProjectSwitcherModalProps) {
    const [mode, setMode] = useState<"switch" | "create">("switch");
    const [selectedId, setSelectedId] = useState<string | null>(activeProjectId);
    const [newProjectName, setNewProjectName] = useState("");
    const [isPending, startTransition] = useTransition();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode("switch");
            setSelectedId(activeProjectId);
            setNewProjectName("");
        }
    }, [isOpen, activeProjectId]);

    const handleSwitch = () => {
        if (!selectedId || selectedId === activeProjectId) {
            onClose();
            return;
        }
        startTransition(async () => {
            try {
                await switchProject(selectedId);
                onClose();
            } catch (error) {
                console.error("Failed to switch project:", error);
            }
        });
    };

    const handleCreate = () => {
        if (!newProjectName.trim()) return;
        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append("name", newProjectName);
                const result = await createProject(formData);

                if (result.project?.id) {
                    await switchProject(result.project.id);
                }

                setMode("switch");
                setNewProjectName("");
                onClose();
            } catch (error) {
                console.error("Failed to create project:", error);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isPending && onClose()}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden gap-0 border-0"
                style={{
                    backgroundColor: '#1C1C1F',
                    boxShadow: shadows.level3,
                }}
            >
                {/* Subtle gradient warmth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-lg" />

                <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-white/[0.06] bg-white/[0.02]">
                    <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        {mode === "create" && (
                            <button
                                className="h-7 w-7 -ml-1 mr-1 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                onClick={() => setMode("switch")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        )}
                        {mode === "switch" ? "Switch Project" : "Create New Project"}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative p-6">
                    {mode === "switch" ? (
                        <div className="space-y-5">
                            {/* Projects List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 -mr-1 scrollbar-hide">
                                {projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedId(project.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left group",
                                            selectedId === project.id
                                                ? "bg-white/[0.06] border-white/[0.12]"
                                                : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04]"
                                        )}
                                        style={{
                                            boxShadow: selectedId === project.id ? shadows.level1 : 'none'
                                        }}
                                    >
                                        <div className={cn(
                                            "flex-shrink-0 size-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all overflow-hidden border",
                                            selectedId === project.id
                                                ? "bg-[#18181B] text-white border-white/[0.1]"
                                                : "bg-[#18181B] text-zinc-400 border-white/[0.06] group-hover:text-zinc-200"
                                        )}>
                                            {project.brand_settings?.logoUrl ? (
                                                <img
                                                    src={project.brand_settings.logoUrl}
                                                    alt={project.name || "Project Logo"}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            ) : (
                                                <span>{project.name?.slice(0, 2).toUpperCase() || "P"}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-medium truncate",
                                                selectedId === project.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                                            )}>
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                {selectedId === project.id ? "Selected" : "Click to select"}
                                            </p>
                                        </div>
                                        {selectedId === project.id && (
                                            <div className="flex-shrink-0 size-5 rounded-full bg-[#BFFF00] flex items-center justify-center">
                                                <Check className="h-3 w-3 text-black" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-1">
                                <Button
                                    variant="outline"
                                    onClick={() => setMode("create")}
                                    className="flex-1 border-dashed border-white/[0.1] bg-transparent hover:bg-white/[0.04] hover:border-white/[0.15] text-zinc-400 hover:text-white h-11 rounded-lg transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Project
                                </Button>
                                <Button
                                    onClick={handleSwitch}
                                    disabled={isPending || !selectedId}
                                    className="flex-1 h-11 rounded-lg font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    style={{
                                        backgroundColor: '#BFFF00',
                                        boxShadow: shadows.glowLime,
                                    }}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {selectedId === activeProjectId ? "Close" : "Switch"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Create Form */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="projectName" className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                        Project Name
                                    </Label>
                                    <Input
                                        id="projectName"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="e.g. My Awesome Startup"
                                        className="h-11 bg-[#18181B] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-white focus:ring-1 focus:ring-white rounded-lg transition-all"
                                        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                                        autoFocus
                                    />
                                    <p className="text-xs text-zinc-500">Pick a unique name for your project.</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-1">
                                <Button
                                    variant="ghost"
                                    onClick={() => setMode("switch")}
                                    className="flex-1 h-11 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={isPending || !newProjectName.trim()}
                                    className="flex-1 h-11 rounded-lg font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    style={{
                                        backgroundColor: '#BFFF00',
                                        boxShadow: shadows.glowLime,
                                    }}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Create & Switch
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
