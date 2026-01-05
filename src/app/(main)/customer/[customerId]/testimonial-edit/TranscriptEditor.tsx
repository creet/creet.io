"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TranscriptEditorProps {
    initialText: string;
    testimonialId: string | number;
}

export function TranscriptEditor({ initialText, testimonialId }: TranscriptEditorProps) {
    const [text, setText] = useState(initialText);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        // In a real app, you might want to debounce this and save to DB
        // or provide a "Save" button. 
        // For now, we just allow editing state as requested.
    };

    return (
        <div className="relative group">
            <Textarea
                value={text}
                onChange={handleChange}
                className="min-h-[200px] w-full bg-zinc-900/50 border-zinc-800 text-zinc-200 resize-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 leading-relaxed font-light"
                placeholder="No transcript available."
            />
            {/* Optional: Add save indicator or button logic here later */}
        </div>
    );
}
