import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { MOCK_CATEGORIES, PLATFORM_META, PlatformType } from "@/pages/platform/data/mockData";
import { useStreams } from "@/pages/platform/hooks/useStreams";
import { MobileStreamCard } from "../components/MobileStreamCard";
import { MobileCategoryPill } from "../components/MobileCategoryPill";
import { formatViewerCount } from "@/pages/platform/data/mockData";
import { cn } from "@caption-cam/core/lib/utils";
import { useNavigate } from "react-router-dom";

const TAGS = ["All", "Gaming", "IRL", "Music", "Creative", "Esports", "Tech", "Food", "Fitness"];

export const MobileBrowsePage: React.FC = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const [selectedTag, setSelectedTag] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const { data: streams = [] } = useStreams();

    // Filter categories by tag
    const filteredCategories = selectedTag === "All"
        ? MOCK_CATEGORIES
        : MOCK_CATEGORIES.filter((c) => c.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())));

    // If viewing a specific category
    if (category) {
        const cat = MOCK_CATEGORIES.find((c) => c.slug === category);
        const categoryStreams = streams.filter((s) => s.categorySlug === category);

        return (
            <div className="min-h-full">
                <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate("/m/browse")}
                        className="mobile-icon-btn"
                        aria-label="Back to browse"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="mobile-fluid-title">{cat?.name || category}</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">{categoryStreams.length} channels streaming</p>
                    </div>
                </div>
                <div className="px-4 space-y-4 pb-6">
                    {categoryStreams.map((ch) => (
                        <MobileStreamCard key={ch.id} channel={ch} />
                    ))}
                    {categoryStreams.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-muted-foreground text-sm">No streams in this category right now.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            {/* Search bar */}
            <div className="px-4 pt-4 pb-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full bg-muted/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all min-h-[44px]"
                        aria-label="Search categories"
                    />
                </div>
            </div>

            {/* Tag pills */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Category filters">
                {TAGS.map((tag) => (
                    <MobileCategoryPill
                        key={tag}
                        label={tag}
                        active={selectedTag === tag}
                        onClick={() => setSelectedTag(tag)}
                    />
                ))}
            </div>

            {/* Categories grid — responsive 2 → 3 cols */}
            <div className="px-4 pt-3">
                <h2 className="mobile-fluid-subtitle mb-3" id="categories-heading">Categories</h2>
                <div className="grid grid-cols-2 phone:grid-cols-3 gap-3" role="list" aria-labelledby="categories-heading">
                    {filteredCategories
                        .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/m/browse/${cat.slug}`}
                                className="relative rounded-2xl overflow-hidden aspect-[4/5] mobile-card"
                                role="listitem"
                                aria-label={`${cat.name} — ${formatViewerCount(cat.viewers)} watching`}
                            >
                                <img
                                    src={cat.thumbnail}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <p className="text-white text-[13px] font-bold leading-tight line-clamp-2">{cat.name}</p>
                                    <p className="text-white/60 text-[10px] mt-0.5">{formatViewerCount(cat.viewers)} watching</p>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>

            {/* Live streams section */}
            <div className="px-4 pt-6 pb-6">
                <h2 className="mobile-fluid-subtitle mb-3">Live Now</h2>
                <div className="space-y-4">
                    {streams.filter((s) => s.isLive).slice(0, 8).map((ch) => (
                        <MobileStreamCard key={ch.id} channel={ch} variant="compact" />
                    ))}
                </div>
            </div>
        </div>
    );
};
