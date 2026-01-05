export default function PublicFormLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Minimal layout - just pass through children
    // The styling is handled by the root layout and individual components
    return children;
}
