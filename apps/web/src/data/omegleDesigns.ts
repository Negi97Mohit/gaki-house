import omegleSplitView from './omegle-designs/omegle-design-split-view.json';
import omeglePipLarge from './omegle-designs/omegle-design-pip-large.json';
import omegleTheater from './omegle-designs/omegle-design-theater.json';
import omegleGridChat from './omegle-designs/omegle-design-grid-chat.json';
import omegleMinimal from './omegle-designs/omegle-design-minimal.json';
import omegleVerticalStack from './omegle-designs/omegle-design-vertical-stack.json';
import omegleSidebarRight from './omegle-designs/omegle-design-sidebar-right.json';
import omegleFocusMode from './omegle-designs/omegle-design-focus-mode.json';
// New designs
import omegleCornerPip from './omegle-designs/omegle-design-corner-pip.json';
import omegleHorizontalStack from './omegle-designs/omegle-design-horizontal-stack.json';
import omegleDiamond from './omegle-designs/omegle-design-diamond.json';
import omegleCinema from './omegle-designs/omegle-design-cinema.json';
import omegleSpotlight from './omegle-designs/omegle-design-spotlight.json';
import omegleCards from './omegle-designs/omegle-design-cards.json';
import omegleDuo from './omegle-designs/omegle-design-duo.json';
import omeglePresenter from './omegle-designs/omegle-design-presenter.json';
import omegleAsymmetric from './omegle-designs/omegle-design-asymmetric.json';
import omeglePortrait from './omegle-designs/omegle-design-portrait.json';
import { OmegleDesign } from "@gaki/core/types/omegle";

export const omegleDesigns: OmegleDesign[] = [
    omegleSplitView as OmegleDesign,
    omeglePipLarge as OmegleDesign,
    omegleTheater as OmegleDesign,
    omegleGridChat as OmegleDesign,
    omegleMinimal as OmegleDesign,
    omegleVerticalStack as OmegleDesign,
    omegleSidebarRight as OmegleDesign,
    omegleFocusMode as OmegleDesign,
    // New designs
    omegleCornerPip as OmegleDesign,
    omegleHorizontalStack as OmegleDesign,
    omegleDiamond as OmegleDesign,
    omegleCinema as OmegleDesign,
    omegleSpotlight as OmegleDesign,
    omegleCards as OmegleDesign,
    omegleDuo as OmegleDesign,
    omeglePresenter as OmegleDesign,
    omegleAsymmetric as OmegleDesign,
    omeglePortrait as OmegleDesign,
];

export const getOmegleDesign = (id: string): OmegleDesign | undefined => {
    return omegleDesigns.find(design => design.id === id);
};

export const getDefaultOmegleDesign = (): OmegleDesign => {
    return omegleDesigns[0]; // Split View as default
};

export const getOmegleDesignIds = (): string[] => {
    return omegleDesigns.map(design => design.id);
};

export const getOmegleDesignNames = (): { id: string; name: string }[] => {
    return omegleDesigns.map(design => ({
        id: design.id,
        name: design.name,
    }));
};
