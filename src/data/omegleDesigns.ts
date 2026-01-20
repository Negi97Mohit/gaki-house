import omegleSplitView from './omegle-designs/omegle-design-split-view.json';
import omeglePipLarge from './omegle-designs/omegle-design-pip-large.json';
import omegleTheater from './omegle-designs/omegle-design-theater.json';
import omegleGridChat from './omegle-designs/omegle-design-grid-chat.json';
import omegleMinimal from './omegle-designs/omegle-design-minimal.json';
import omegleVerticalStack from './omegle-designs/omegle-design-vertical-stack.json';
import omegleSidebarRight from './omegle-designs/omegle-design-sidebar-right.json';
import omegleFocusMode from './omegle-designs/omegle-design-focus-mode.json';
import { OmegleDesign } from '@/types/omegle';

export const omegleDesigns: OmegleDesign[] = [
    omegleSplitView as OmegleDesign,
    omeglePipLarge as OmegleDesign,
    omegleTheater as OmegleDesign,
    omegleGridChat as OmegleDesign,
    omegleMinimal as OmegleDesign,
    omegleVerticalStack as OmegleDesign,
    omegleSidebarRight as OmegleDesign,
    omegleFocusMode as OmegleDesign,
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
