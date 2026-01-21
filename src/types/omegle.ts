// Omegle feature type definitions

export interface OmegleDesign {
    id: string;
    name: string;
    description: string;
    styleTags: string[];
    canvasAspectRatio: string;
    background: {
        blankCanvasColor: string;
        backgroundEffect: string;
    };
    layout: {
        strangerVideo: VideoLayout;
        localVideo: VideoLayout;
        chatBox: ChatBoxLayout;
        controls: ControlsLayout;
    };
    effects: {
        videoFilter?: string;
        transition?: string;
        transitionDuration?: number;
        letterbox?: boolean;
        letterboxColor?: string;
    };
    typography: {
        fontFamily: string;
        fontSize: number;
        color: string;
        lineHeight?: number;
    };
    theme?: {
        primary?: string;
        secondary?: string;
        text?: string;
        textMuted?: string;
        border?: string;
    };
    animations?: {
        [key: string]: AnimationConfig;
    };
}

export interface VideoLayout {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    mirror?: boolean;
    shape?: 'rectangle' | 'rounded' | 'circle';
    borderRadius?: number;
    border?: {
        color: string;
        width: number;
    };
    shadow?: {
        blur: number;
        color: string;
    };
    aspectRatio?: string;
    objectFit?: 'contain' | 'cover';
}

export interface ChatBoxLayout {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    collapsed?: boolean;
    expandOnInteraction?: boolean;
    expandOnNewMessage?: boolean;
    expandedSize?: { width: number; height: number };
    autoCollapseDelay?: number;
    floating?: boolean;
    collapsible?: boolean;
    style?: React.CSSProperties;
}

export interface ControlsLayout {
    position: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
    zIndex: number;
    autoHide?: boolean;
    autoHideDelay?: number;
    showOnHover?: boolean;
    style?: React.CSSProperties;
}

export interface AnimationConfig {
    type: string;
    duration: number;
    easing: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    timestamp: number;
    isLocal: boolean;
}

export type MatchStatus =
    | 'idle'
    | 'searching'
    | 'connected'
    | 'disconnected'
    | 'error';

export interface OmegleConnection {
    roomId: string | null;
    partnerId: string | null;
    isInitiator: boolean;
    matchStatus: MatchStatus;
    remoteStream: MediaStream | null;
    localStream: MediaStream | null;
    remoteMediaState: {
        video: boolean;
        audio: boolean;
    };
}

export interface WebRTCConfig {
    iceServers: RTCIceServer[];
    iceCandidatePoolSize?: number;
}

export interface SignalingMessage {
    type: 'offer' | 'answer' | 'ice-candidate' | 'chat' | 'disconnect';
    payload: any;
    roomId?: string;
    senderId?: string;
}

export interface OmegleStats {
    connectionTime: number;
    messagesExchanged: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Global Omegle Theme type
export interface OmegleTheme {
    id: string;
    name: string;
    description: string;
    colors: {
        // Main background
        background: string;
        backgroundSecondary: string;
        // Video panel colors
        videoBorder: string;
        videoBackground: string;
        videoOverlay: string;
        // Chat colors
        chatBackground: string;
        chatBorder: string;
        chatMessageLocal: string;
        chatMessageStranger: string;
        chatText: string;
        chatTextMuted: string;
        chatInputBackground: string;
        chatInputBorder: string;
        // Controls colors
        controlsBackground: string;
        controlsBorder: string;
        controlsButton: string;
        controlsButtonHover: string;
        controlsButtonActive: string;
        controlsIcon: string;
        // Accent colors
        primary: string;
        primaryForeground: string;
        secondary: string;
        secondaryForeground: string;
        accent: string;
        accentForeground: string;
        // Status colors
        success: string;
        warning: string;
        error: string;
        // Text colors
        text: string;
        textMuted: string;
        textInverse: string;
    };
    effects: {
        borderRadius: string;
        borderWidth: string;
        shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong';
        glassEffect: boolean;
        gradientOverlay: boolean;
    };
    typography: {
        fontFamily: string;
        fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    };
}
