import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, Settings, Radio, DollarSign, TrendingUp, Users, Eye, Clock,
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";
import { useAuth } from "../context/AuthContext";
import { useStreams } from "../hooks/useStreams";
import { formatViewerCount } from "../data/mockData";

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "stream-manager", label: "Stream Manager", icon: Radio },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "channel", label: "Channel Settings", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const DashboardPage: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("analytics");

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <BarChart3 className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Creator Dashboard</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Sign in to access your creator dashboard and manage your streams.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar Tabs */}
      <nav className="w-56 border-r border-border/30 p-4 space-y-1 shrink-0 hidden md:block">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-b border-border/30 px-2 overflow-x-auto shrink-0 absolute top-0 left-0 right-0 bg-background z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "stream-manager" && <StreamManagerTab />}
        {activeTab === "revenue" && <RevenueTab />}
        {activeTab === "channel" && <ChannelSettingsTab />}
      </div>
    </div>
  );
};

// ── Analytics Tab ──
const AnalyticsTab: React.FC = () => {
  const { data: streams = [] } = useStreams();
  const liveCount = streams.filter(s => s.isLive).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Stream Analytics</h2>
        <p className="text-sm text-muted-foreground">Overview of your streaming performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value="—"
          subtitle="Start streaming to track"
          icon={Eye}
          trend={null}
        />
        <StatCard
          label="Avg Viewers"
          value="—"
          subtitle="No data yet"
          icon={Users}
          trend={null}
        />
        <StatCard
          label="Watch Time"
          value="—"
          subtitle="No streams recorded"
          icon={Clock}
          trend={null}
        />
        <StatCard
          label="Followers"
          value="—"
          subtitle="Grow your audience"
          icon={TrendingUp}
          trend={null}
        />
      </div>

      {/* Empty state for charts */}
      <div className="border border-border/30 rounded-xl p-8 text-center">
        <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">No analytics data yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Start streaming to see viewer statistics, engagement metrics, and growth trends here.
        </p>
        <Link
          to="/platform"
          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90"
        >
          Go Live
        </Link>
      </div>

      {/* Recent Streams placeholder */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Streams</h3>
        <div className="border border-border/30 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">No past streams to show. Your stream history will appear here.</p>
        </div>
      </div>
    </div>
  );
};

// ── Stream Manager Tab ──
const StreamManagerTab: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Stream Manager</h2>
        <p className="text-sm text-muted-foreground">Configure your stream before going live.</p>
      </div>

      {/* Stream Info */}
      <div className="space-y-4">
        <FieldGroup label="Stream Title">
          <input
            type="text"
            placeholder="Enter your stream title..."
            className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </FieldGroup>

        <FieldGroup label="Category">
          <input
            type="text"
            placeholder="Search for a category..."
            className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </FieldGroup>

        <FieldGroup label="Tags">
          <input
            type="text"
            placeholder="Add tags separated by comma..."
            className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">Tags help viewers find your stream.</p>
        </FieldGroup>

        <FieldGroup label="Stream Key">
          <div className="flex gap-2">
            <input
              type="password"
              value="••••••••••••••••"
              readOnly
              className="flex-1 bg-muted/50 border border-border/30 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
            <button className="px-3 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80">
              Copy
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Use this key in your streaming software (OBS, Streamlabs, etc).</p>
        </FieldGroup>
      </div>

      <div className="flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Radio className="w-4 h-4" />
          Go Live
        </Link>
        <button className="px-5 py-2.5 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80">
          Save Settings
        </button>
      </div>
    </div>
  );
};

// ── Revenue Tab ──
const RevenueTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Revenue & Donations</h2>
        <p className="text-sm text-muted-foreground">Track your earnings and manage payouts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Earned" value="$0.00" subtitle="No revenue yet" icon={DollarSign} trend={null} />
        <StatCard label="This Month" value="$0.00" subtitle="Current period" icon={TrendingUp} trend={null} />
        <StatCard label="Pending Payout" value="$0.00" subtitle="Minimum $50 to withdraw" icon={ArrowUpRight} trend={null} />
      </div>

      {/* Donation History */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Donation History</h3>
        <div className="border border-border/30 rounded-xl p-8 text-center">
          <DollarSign className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No donations received yet.</p>
          <p className="text-xs text-muted-foreground mt-1">When viewers donate, they'll appear here.</p>
        </div>
      </div>

      {/* Payout Settings */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Payout Settings</h3>
        <div className="border border-border/30 rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-4">Connect a payment method to receive payouts.</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">
            Connect Payment Method
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Channel Settings Tab ──
const ChannelSettingsTab: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Channel Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your channel appearance.</p>
      </div>

      <div className="space-y-4">
        <FieldGroup label="Channel Banner">
          <div className="h-32 bg-muted rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Click to upload a banner (1920x480 recommended)</p>
          </div>
        </FieldGroup>

        <FieldGroup label="Channel Description">
          <textarea
            placeholder="Tell viewers about your channel..."
            rows={4}
            className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
          />
        </FieldGroup>

        <FieldGroup label="Social Links">
          <div className="space-y-2">
            {["Twitter/X", "YouTube", "Instagram", "Discord"].map(platform => (
              <input
                key={platform}
                type="url"
                placeholder={`${platform} URL`}
                className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Schedule">
          <textarea
            placeholder="Let viewers know your streaming schedule..."
            rows={3}
            className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
          />
        </FieldGroup>
      </div>

      <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity">
        Save Changes
      </button>
    </div>
  );
};

// ── Shared Components ──
const StatCard: React.FC<{
  label: string;
  value: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  trend: "up" | "down" | null;
}> = ({ label, value, subtitle, icon: Icon, trend }) => (
  <div className="bg-card border border-border/30 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <Icon className="w-4 h-4 text-muted-foreground/60" />
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
      {trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
      {trend === "down" && <ArrowDownRight className="w-3 h-3 text-destructive" />}
      {subtitle}
    </p>
  </div>
);

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);
