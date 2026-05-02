import React from "react";
import { SocialBannerDesign } from "@gaki/core/types/banner";

interface StaticBannerBackgroundProps {
    design: SocialBannerDesign;
    className?: string; // Allow passing Tailwind classes or cleanup overrides
    // We might want to pass children if we want to use the Flexbox layout directly here,
    // OR we keep it purely as a background renderer for the container styles (minus layout).
}

export const StaticBannerBackground: React.FC<StaticBannerBackgroundProps> = ({
    design,
    className,
}) => {
    return (
        <div
            style={{
                ...design.styles.container,
                // Override layout props if we are in "editing" mode where children are absolutely positioned.
                // However, this component is JUST the background visual.
                // If the container style includes padding, border, etc., we want those.
                // If it includes `display: flex`, we might want to override that if we are using absolute positioning for kids.
                // But for now, let's just apply the styles as is. The parent can override via style prop if needed?
                // Actually, React styles are inline. We can't easily override them unless we filter them.
            }}
            className={className}
        >
            {/* No children here, strictly background/container visual */}
        </div>
    );
};
