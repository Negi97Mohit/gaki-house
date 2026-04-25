import { useState } from "react";
import {
  ChevronRight,
  User,
  Bell,
  Shield,
  HelpCircle,
  FileJson,
  Smartphone,
  Gauge,
} from "lucide-react";
import { Switch } from "@caption-cam/ui/switch";

const SettingsScreen = () => {
  const [saveToRoll, setSaveToRoll] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const sections = [
    {
      title: "Broadcast",
      items: [
        {
          icon: Smartphone,
          label: "Stream Resolution",
          value: "1080p",
          chevron: true,
        },
        {
          icon: Gauge,
          label: "Video Bitrate",
          value: "6500 kbps",
          chevron: true,
        },
        {
          icon: FileJson,
          label: "Save Stream to Camera Roll",
          toggle: { value: saveToRoll, set: setSaveToRoll },
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          icon: FileJson,
          label: "Import OBS JSON Profile",
          value: "",
          chevron: true,
          featured: true,
        },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile", value: "@gaki_creator", chevron: true },
        {
          icon: Bell,
          label: "Notifications",
          toggle: { value: notifications, set: setNotifications },
        },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: Shield, label: "Privacy", value: "Followers", chevron: true },
        { icon: HelpCircle, label: "Help center", value: "", chevron: true },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="text-[10px] font-bold tracking-[0.15em] text-neutral-900/60 uppercase px-2 mb-1.5">
            {section.title}
          </div>
          <div className="rounded-2xl bg-white/30 border border-white/50 overflow-hidden">
            {section.items.map((item: any, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${
                    i !== section.items.length - 1
                      ? "border-b border-white/40"
                      : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      item.featured
                        ? "bg-gradient-primary"
                        : "bg-neutral-900/10"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${item.featured ? "text-white" : "text-neutral-900"}`}
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="flex-1 font-medium text-neutral-900 text-sm">
                    {item.label}
                  </span>
                  {item.toggle ? (
                    <Switch
                      checked={item.toggle.value}
                      onCheckedChange={item.toggle.set}
                    />
                  ) : (
                    <>
                      {item.value && (
                        <span className="text-xs text-neutral-900/60">
                          {item.value}
                        </span>
                      )}
                      {item.chevron && (
                        <ChevronRight className="h-4 w-4 text-neutral-900/50" />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="text-center text-[10px] text-neutral-900/55 pt-1">
        Gaki Studio · v0.1.0
      </div>
    </div>
  );
};

export default SettingsScreen;
