export interface ChatTheme {
    id: string;
    name: string;
    containerClass: string;
    headerClass: string;
    messageListClass: string;
    inputAreaClass: string;
    inputClass: string;
    buttonClass: string;
    localBubbleClass: string;
    remoteBubbleClass: string;
}

export const chatThemes: ChatTheme[] = [
    {
        id: 'classic',
        name: 'Classic',
        containerClass: 'bg-white rounded-lg border border-gray-300 shadow-lg',
        headerClass: 'bg-gray-100 border-b border-gray-200 text-gray-700',
        messageListClass: 'bg-white',
        inputAreaClass: 'bg-gray-50 border-t border-gray-200',
        inputClass: 'bg-white text-gray-900 border-gray-300 placeholder:text-gray-400',
        buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
        localBubbleClass: 'bg-blue-500 text-white',
        remoteBubbleClass: 'bg-gray-200 text-gray-800'
    },
    {
        id: 'dark',
        name: 'Dark Mode',
        containerClass: 'bg-zinc-900/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl',
        headerClass: 'bg-black/40 border-b border-white/5 text-white/90',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-black/20 border-t border-white/5',
        inputClass: 'bg-white/5 text-white border-white/10 placeholder:text-white/30',
        buttonClass: 'bg-white/10 hover:bg-white/20 text-white',
        localBubbleClass: 'bg-blue-600 text-white',
        remoteBubbleClass: 'bg-zinc-700 text-white'
    },
    {
        id: 'neon',
        name: 'Neon Cyber',
        containerClass: 'bg-black/80 backdrop-blur-xl rounded-none border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        headerClass: 'bg-green-500/10 border-b border-green-500/50 text-green-400 font-mono tracking-wider',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-black/60 border-t border-green-500/50',
        inputClass: 'bg-black text-green-400 border-green-500/50 placeholder:text-green-700 font-mono focus:ring-green-500/50',
        buttonClass: 'bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-wider font-mono',
        localBubbleClass: 'bg-green-600/20 border border-green-500 text-green-300 font-mono',
        remoteBubbleClass: 'bg-purple-600/20 border border-purple-500 text-purple-300 font-mono'
    },
    {
        id: 'bubblegum',
        name: 'Bubblegum',
        containerClass: 'bg-pink-50/90 backdrop-blur-lg rounded-[2rem] border-4 border-white shadow-xl',
        headerClass: 'bg-pink-100/50 border-b border-pink-200 text-pink-600 font-bold',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-white/50 border-t border-pink-100',
        inputClass: 'bg-white text-pink-700 border-pink-200 placeholder:text-pink-300 rounded-full px-4',
        buttonClass: 'bg-pink-500 hover:bg-pink-400 text-white rounded-full shadow-lg hover:shadow-pink-300/50 transition-all hover:scale-105',
        localBubbleClass: 'bg-gradient-to-tr from-pink-400 to-purple-400 text-white rounded-tr-none shadow-md',
        remoteBubbleClass: 'bg-white text-pink-600 rounded-tl-none shadow-md'
    },
    {
        id: 'glass',
        name: 'Glassmorphism',
        containerClass: 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl ring-1 ring-black/5',
        headerClass: 'bg-white/5 border-b border-white/10 text-white',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-white/5 border-t border-white/10',
        inputClass: 'bg-black/20 hover:bg-black/30 text-white border-transparent placeholder:text-white/40 transition-colors',
        buttonClass: 'bg-white/20 hover:bg-white/30 text-white border border-white/10 backdrop-blur-sm',
        localBubbleClass: 'bg-white/20 backdrop-blur-sm border border-white/10 text-white',
        remoteBubbleClass: 'bg-black/40 backdrop-blur-sm border border-white/5 text-white/90'
    }
];

export const getChatTheme = (id: string) => chatThemes.find(t => t.id === id) || chatThemes[1]; // Default to dark
