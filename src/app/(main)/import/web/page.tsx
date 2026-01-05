import ImportWebClient from "./ImportWebClient";
import { getAllBrands } from "@/lib/brands";

export default function ImportWebPage() {
    // Use the comprehensive brand config instead of storage files
    const sources = getAllBrands()
        .filter(brand => brand.id !== 'manual' && brand.id !== 'form') // Exclude internal sources
        .map(brand => ({
            id: brand.id,
            label: brand.name,
            image: "", // Not used with new icon system, but keeping to satisfy interface temporarily
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

    return <ImportWebClient sources={sources} />;
}
