import { RequireAuth } from "@/components/auth/RequireAuth"
import { WidgetEditorClient } from "./WidgetEditorClient"
import { Toaster } from "sonner"

interface PageProps {
    params: Promise<{
        widgetId: string
    }>
}

export default async function WidgetEditorPage({ params }: PageProps) {
    const { widgetId } = await params
    return (
        <RequireAuth>
            <WidgetEditorClient widgetId={widgetId} />
            <Toaster position="bottom-right" theme="dark" richColors />
        </RequireAuth>
    )
}

