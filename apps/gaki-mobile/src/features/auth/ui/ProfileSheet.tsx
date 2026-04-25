import { useState, useRef } from "react";
import { LogOut, User, Loader2, Grid, Clock, Settings, Info, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SheetDrawer from "@/components/ui/SheetDrawer";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

type TabType = "content" | "history" | "settings" | "info";

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap active:scale-95",
      active 
        ? "bg-neutral-900 text-white shadow-md" 
        : "bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200"
    )}
  >
    {icon}
    {label}
  </button>
);

const ContentTab = () => (
  <div className="grid grid-cols-3 gap-2 pb-8">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <div key={i} className="aspect-[9/16] bg-neutral-200/60 rounded-xl overflow-hidden relative group">
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
           <span>{Math.floor(Math.random() * 10)}K views</span>
         </div>
      </div>
    ))}
  </div>
);

const HistoryTab = () => (
  <div className="space-y-3 pb-8">
    {[
      { title: "Late Night Coding", date: "2 days ago", duration: "2h 15m" },
      { title: "Building an App", date: "1 week ago", duration: "4h 30m" },
      { title: "Q&A Session", date: "2 weeks ago", duration: "1h 45m" },
      { title: "Design Review", date: "3 weeks ago", duration: "50m" },
    ].map((stream, i) => (
      <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-violet-100/50 flex items-center justify-center text-violet-600 shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-neutral-900 text-sm truncate">{stream.title}</div>
          <div className="text-xs text-neutral-500 mt-0.5">{stream.date} • {stream.duration}</div>
        </div>
      </div>
    ))}
  </div>
);

const SettingsTab = () => (
  <div className="space-y-3 pb-8">
    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 shadow-sm">
      <div className="pr-4">
        <div className="font-semibold text-neutral-900 text-sm">Save Streams</div>
        <div className="text-xs text-neutral-500 mt-0.5">Automatically save broadcasts</div>
      </div>
      <div className="h-6 w-11 rounded-full bg-green-500 relative flex items-center px-1 shrink-0 cursor-pointer">
        <div className="h-4 w-4 rounded-full bg-white absolute right-1 shadow-sm" />
      </div>
    </div>
    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 shadow-sm">
      <div className="pr-4">
        <div className="font-semibold text-neutral-900 text-sm">Low Latency Mode</div>
        <div className="text-xs text-neutral-500 mt-0.5">Optimized for real-time interaction</div>
      </div>
      <div className="h-6 w-11 rounded-full bg-neutral-300 relative flex items-center px-1 shrink-0 cursor-pointer">
        <div className="h-4 w-4 rounded-full bg-white absolute left-1 shadow-sm" />
      </div>
    </div>
    <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 shadow-sm">
      <div className="pr-4">
        <div className="font-semibold text-neutral-900 text-sm">Stream Key</div>
        <div className="text-xs text-neutral-500 mt-0.5">••••••••••••••••</div>
      </div>
      <button className="text-xs text-violet-600 font-semibold px-3 py-1.5 bg-violet-100/50 rounded-lg shrink-0 hover:bg-violet-100 transition-colors">
        Copy
      </button>
    </div>
  </div>
);

const InfoTab = ({ profile, handleSignOut, signingOut, email }: any) => (
  <div className="pb-8">
    <div className="rounded-2xl bg-neutral-50/80 border border-neutral-100 shadow-sm p-4 mb-4">
      <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-400 mb-3">
        Account Info
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Email</span>
          <span className="font-medium text-neutral-900 truncate max-w-[60%] text-right">
            {email || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Username</span>
          <span className="font-medium text-neutral-900">
            {profile?.username || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Member since</span>
          <span className="font-medium text-neutral-900">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
              : "—"}
          </span>
        </div>
      </div>
    </div>

    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full h-12 rounded-2xl bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60 border border-red-100"
    >
      {signingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Sign out
        </>
      )}
    </button>
  </div>
);

const ProfileSheet = ({ open, onClose }: ProfileSheetProps) => {
  const { user, profile, signOut, updateProfileData } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      onClose();
    } finally {
      setSigningOut(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAvatar = type === "avatar";
    const setUploading = isAvatar ? setUploadingAvatar : setUploadingBanner;
    
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `users/${user.uid}/${type}_${Date.now()}.${ext}`;
      const fileRef = ref(storage, path);
      
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      await updateProfileData({
        [isAvatar ? "avatar_url" : "banner_url"]: url
      });
      
      toast.success(`${isAvatar ? "Profile picture" : "Banner"} updated`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const displayName =
    profile?.display_name || profile?.username || user.displayName || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.photoURL;
  const bannerUrl = profile?.banner_url;
  const email = user.email || "";

  return (
    <SheetDrawer open={open} onClose={onClose}>
      <div className="flex flex-col h-full animate-in fade-in duration-300">
        
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={avatarInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileUpload(e, "avatar")} 
        />
        <input 
          type="file" 
          ref={bannerInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileUpload(e, "banner")} 
        />

        {/* Banner & Avatar section */}
        <div className="relative mb-14 mt-1 px-1">
          {/* Banner */}
          <div 
            onClick={() => bannerInputRef.current?.click()}
            className="h-32 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl w-full shadow-inner relative overflow-hidden group cursor-pointer"
          >
            {bannerUrl && (
              <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingBanner ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white drop-shadow-md" />
              )}
            </div>
          </div>
          
          {/* Avatar overlapping */}
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-10 left-6 h-24 w-24 rounded-full border-4 border-white/95 bg-white shadow-md flex items-center justify-center overflow-hidden cursor-pointer group"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-neutral-400" />
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white drop-shadow-md" />
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-5 mb-6">
          <div className="font-display text-2xl text-neutral-900 leading-tight font-bold">
            {displayName}
          </div>
          <div className="text-sm text-neutral-500 mb-4 font-medium">
            @{profile?.username || email.split("@")[0] || "user"}
          </div>
          
          {profile?.bio && (
            <div className="text-sm text-neutral-700 mb-5 leading-relaxed max-w-[90%]">
              {profile.bio}
            </div>
          )}

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900 text-base">1.2K</span>
              <span className="text-neutral-500">Followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900 text-base">248</span>
              <span className="text-neutral-500">Following</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mask-edges">
            <TabButton 
              active={activeTab === "content"} 
              onClick={() => setActiveTab("content")}
              icon={<Grid className="h-4 w-4" />}
              label="Content"
            />
            <TabButton 
              active={activeTab === "history"} 
              onClick={() => setActiveTab("history")}
              icon={<Clock className="h-4 w-4" />}
              label="History"
            />
            <TabButton 
              active={activeTab === "settings"} 
              onClick={() => setActiveTab("settings")}
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
            />
            <TabButton 
              active={activeTab === "info"} 
              onClick={() => setActiveTab("info")}
              icon={<Info className="h-4 w-4" />}
              label="Info"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 flex-1">
          {activeTab === "content" && <ContentTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "info" && (
            <InfoTab 
              profile={profile} 
              handleSignOut={handleSignOut} 
              signingOut={signingOut} 
              email={email} 
            />
          )}
        </div>
        
      </div>
    </SheetDrawer>
  );
};

export default ProfileSheet;

