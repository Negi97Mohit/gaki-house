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
    },
    {
        id: 'midnight-blue',
        name: 'Midnight Blue',
        containerClass: 'bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700 shadow-2xl',
        headerClass: 'bg-slate-800/50 border-b border-slate-700 text-slate-200 font-semibold',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-slate-800/30 border-t border-slate-700',
        inputClass: 'bg-slate-800 text-slate-200 border-slate-600 placeholder:text-slate-500 focus:ring-blue-500/50',
        buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20',
        localBubbleClass: 'bg-blue-700 text-white shadow-sm',
        remoteBubbleClass: 'bg-slate-700 text-slate-200 shadow-sm'
    },
    {
        id: 'sunset',
        name: 'Sunset',
        containerClass: 'bg-orange-50/90 backdrop-blur-lg rounded-2xl border-2 border-orange-100 shadow-orange-500/20 shadow-xl',
        headerClass: 'bg-gradient-to-r from-orange-100 to-rose-100 border-b border-orange-200 text-orange-800 font-bold',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-white/60 border-t border-orange-100',
        inputClass: 'bg-white text-orange-900 border-orange-200 placeholder:text-orange-300 focus:border-orange-400',
        buttonClass: 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white',
        localBubbleClass: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md',
        remoteBubbleClass: 'bg-white text-orange-800 border border-orange-100 shadow-sm'
    },
    {
        id: 'forest',
        name: 'Forest',
        containerClass: 'bg-stone-900/95 backdrop-blur-md rounded-lg border border-stone-700 shadow-xl',
        headerClass: 'bg-emerald-900/20 border-b border-stone-700 text-emerald-100 font-medium tracking-wide',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-stone-800/50 border-t border-stone-700',
        inputClass: 'bg-stone-800 text-emerald-100 border-stone-600 placeholder:text-stone-500 focus:border-emerald-700',
        buttonClass: 'bg-emerald-700 hover:bg-emerald-600 text-emerald-100 border border-emerald-600',
        localBubbleClass: 'bg-emerald-800/80 border border-emerald-700 text-emerald-100',
        remoteBubbleClass: 'bg-stone-800 border border-stone-700 text-stone-300'
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        containerClass: 'bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        headerClass: 'bg-black text-white font-bold uppercase tracking-widest border-b-2 border-black',
        messageListClass: 'bg-white',
        inputAreaClass: 'bg-gray-50 border-t-2 border-black',
        inputClass: 'bg-white text-black border-2 border-black rounded-none placeholder:text-gray-500 focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow',
        buttonClass: 'bg-black hover:bg-gray-800 text-white rounded-none border-2 border-black',
        localBubbleClass: 'bg-black text-white rounded-none border-2 border-black',
        remoteBubbleClass: 'bg-white text-black rounded-none border-2 border-black'
    },
    {
        id: 'pixel-art',
        name: 'Pixel Art',
        containerClass: 'bg-indigo-900 rounded-none border-4 border-white shadow-none font-pixel',
        headerClass: 'bg-indigo-800 border-b-4 border-indigo-700 text-yellow-300 font-pixel tracking-wider',
        messageListClass: 'bg-indigo-900',
        inputAreaClass: 'bg-indigo-800 border-t-4 border-indigo-700',
        inputClass: 'bg-indigo-950 text-white border-2 border-indigo-500 rounded-none font-pixel placeholder:text-indigo-400',
        buttonClass: 'bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-bold border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1',
        localBubbleClass: 'bg-indigo-600 text-white border-2 border-indigo-400 rounded-none',
        remoteBubbleClass: 'bg-indigo-800 text-indigo-100 border-2 border-indigo-700 rounded-none'
    },
    {
        id: 'minimalist-white',
        name: 'Minimalist White',
        containerClass: 'bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
        headerClass: 'bg-transparent border-b border-gray-100/50 text-gray-800 font-medium',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-transparent border-t border-gray-100/50',
        inputClass: 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-transparent transition-colors focus:bg-white focus:shadow-sm rounded-xl',
        buttonClass: 'bg-black hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-black/5',
        localBubbleClass: 'bg-black text-white rounded-2xl shadow-sm',
        remoteBubbleClass: 'bg-gray-100 text-gray-800 rounded-2xl'
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        containerClass: 'bg-yellow-400/90 backdrop-blur-sm rounded-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] skew-x-[-1deg]',
        headerClass: 'bg-black text-yellow-400 font-bold uppercase italic border-b-2 border-black',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-black/10 border-t-2 border-black',
        inputClass: 'bg-cyan-900/80 text-cyan-100 border-2 border-black placeholder:text-cyan-500/50 font-mono skew-x-1',
        buttonClass: 'bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] skew-x-1',
        localBubbleClass: 'bg-black text-yellow-400 border-2 border-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        remoteBubbleClass: 'bg-cyan-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
    },
    {
        id: 'vaporwave',
        name: 'Vaporwave',
        containerClass: 'bg-gradient-to-b from-indigo-900/90 to-purple-900/90 backdrop-blur-md rounded-t-xl border-t-2 border-pink-400 shadow-lg shadow-pink-500/20',
        headerClass: 'bg-black/30 border-b border-pink-500/30 text-pink-300 font-light tracking-[0.2em] uppercase',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-black/30 border-t border-cyan-400/30',
        inputClass: 'bg-black/40 text-cyan-200 border-cyan-400/50 placeholder:text-cyan-700/50 font-serif italic',
        buttonClass: 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-bold',
        localBubbleClass: 'bg-pink-500/20 border border-pink-400/50 text-pink-100 shadow-[0_0_10px_rgba(236,72,153,0.3)]',
        remoteBubbleClass: 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
    },
    {
        id: 'terminal',
        name: 'Terminal',
        containerClass: 'bg-black/95 rounded-md border border-green-800 shadow-none font-mono',
        headerClass: 'bg-green-900/20 border-b border-green-900/50 text-green-500',
        messageListClass: 'text-green-500',
        inputAreaClass: 'bg-black border-t border-green-900',
        inputClass: 'bg-black text-green-500 border-green-900 placeholder:text-green-900 focus:border-green-500 focus:ring-0',
        buttonClass: 'bg-green-900/30 hover:bg-green-800/50 text-green-500 border border-green-700',
        localBubbleClass: 'bg-transparent border border-green-500/50 text-green-400 rounded-none',
        remoteBubbleClass: 'bg-transparent border border-gray-700 text-gray-400 rounded-none'
    },
    {
        id: 'candy',
        name: 'Candy',
        containerClass: 'bg-gradient-to-br from-yellow-100 to-pink-100 rounded-3xl border-4 border-white shadow-xl',
        headerClass: 'bg-white/50 border-b border-white text-purple-600 font-bold',
        messageListClass: 'bg-transparent',
        inputAreaClass: 'bg-white/50 border-t border-white',
        inputClass: 'bg-white text-purple-600 border-purple-100 placeholder:text-purple-200 rounded-full',
        buttonClass: 'bg-yellow-400 hover:bg-yellow-300 text-purple-700 font-bold rounded-full shadow-md text-sm uppercase tracking-wide',
        localBubbleClass: 'bg-purple-500 text-white rounded-2xl shadow-sm',
        remoteBubbleClass: 'bg-white text-purple-600 rounded-2xl shadow-sm'
    }
];

export const getChatTheme = (id: string) => chatThemes.find(t => t.id === id) || chatThemes[1]; // Default to dark
