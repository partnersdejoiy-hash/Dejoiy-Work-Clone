import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu, X, Search, Bell, Home, User, Inbox, Star, FileText, HelpCircle, LogOut,
  Briefcase, BookOpen, IdCard, Mail, BarChart3, Wallet, Users,
  ChevronRight, ExternalLink, Check
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const APPS = [
  { path: "/dashboard", label: "Onboarding", Icon: Briefcase },
  { path: "/time-off", label: "Absence", Icon: Briefcase },
  { path: "/people", label: "Directory", Icon: BookOpen },
  { path: "/profile", label: "Personal Information", Icon: IdCard },
  { path: "/it-help", label: "Requests", Icon: Mail },
  { path: "/performance", label: "Performance", Icon: BarChart3 },
  { path: "/payroll", label: "Benefits and Pay", Icon: Wallet },
  { path: "/recruitment", label: "Jobs Hub", Icon: Users },
  { path: "/dashboard", label: "Home", Icon: Home },
  { path: "/analytics", label: "Analytics", Icon: BarChart3 },
  { path: "/tasks", label: "Tasks", Icon: Inbox },
  { path: "/timesheets", label: "Timesheets", Icon: FileText },
  { path: "/calendar", label: "Calendar", Icon: Briefcase },
  { path: "/org-chart", label: "Org Chart", Icon: Users },
  { path: "/expenses", label: "Expenses", Icon: Wallet },
  { path: "/assets", label: "IT Assets", Icon: FileText },
  { path: "/announcements", label: "Announcements", Icon: Mail },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: notifications } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      {/* Top Header — Workday style */}
      <header className="bg-white h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 border-b border-gray-100">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 -ml-2 rounded hover:bg-gray-100"
          data-testid="open-menu"
        >
          <Menu className="w-6 h-6 text-gray-800" strokeWidth={2} />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#0875E1] flex items-center justify-center text-white font-black text-sm">D</div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Dejoiy</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100"
            data-testid="open-search"
          >
            <Search className="w-5 h-5 text-gray-800" strokeWidth={2} />
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="relative p-1 rounded-full hover:bg-gray-100"
            data-testid="open-profile"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) ?? "U"
              )}
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 bg-[#E53935] rounded-full text-[11px] text-white flex items-center justify-center font-bold border-2 border-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <MenuDrawer
          onClose={() => setMenuOpen(false)}
          onNavigate={(p: string) => {
            setMenuOpen(false);
            navigate(p);
          }}
        />
      )}

      {/* Search Drawer */}
      {searchOpen && <SearchDrawer onClose={() => setSearchOpen(false)} />}

      {/* Profile Drawer */}
      {profileOpen && (
        <ProfileDrawer
          onClose={() => setProfileOpen(false)}
          onNavigate={(p: string) => {
            setProfileOpen(false);
            navigate(p);
          }}
          onLogout={async () => {
            setProfileOpen(false);
            await handleLogout();
          }}
          user={user}
          unreadCount={unreadCount}
          notifications={notifications}
          onMarkAllRead={async () => {
            try {
              await markAllRead.mutateAsync();
              queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
            } catch {}
          }}
          onMarkRead={async (id: number) => {
            try {
              await markRead.mutateAsync({ id });
              queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
            } catch {}
          }}
        />
      )}
    </div>
  );
}

function MenuDrawer({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const [tab, setTab] = useState<"apps" | "shortcuts">("apps");

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-150" data-testid="menu-drawer">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
        <button onClick={onClose} className="p-2 -mr-2 rounded hover:bg-gray-100">
          <X className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-5">
        <button
          onClick={() => setTab("apps")}
          className={`px-2 py-3 mr-6 text-base font-semibold relative ${
            tab === "apps" ? "text-[#0875E1]" : "text-gray-500"
          }`}
        >
          Apps
          {tab === "apps" && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#0875E1]" />}
        </button>
        <button
          onClick={() => setTab("shortcuts")}
          className={`px-2 py-3 text-base font-semibold relative ${
            tab === "shortcuts" ? "text-[#0875E1]" : "text-gray-500"
          }`}
        >
          Shortcuts
          {tab === "shortcuts" && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#0875E1]" />}
        </button>
      </div>

      {tab === "apps" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-gray-700">Your Saved Order</span>
            <button className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17l-4-4 4-4M17 7l4 4-4 4M3 13h18M3 11h18" /></svg>
            </button>
          </div>
          <div className="px-2">
            {APPS.map((app) => (
              <button
                key={app.path + app.label}
                onClick={() => onNavigate(app.path)}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-50 text-left"
                data-testid={`menu-app-${app.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-11 h-11 rounded-full bg-[#E8F1FB] flex items-center justify-center shrink-0">
                  <app.Icon className="w-5 h-5 text-[#0875E1]" strokeWidth={1.8} />
                </div>
                <span className="text-gray-800 text-base">{app.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 py-6 border-t border-gray-100 mt-4">
            <button className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <span className="text-lg leading-none">+</span> Add Apps
            </button>
            <button className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="text-7xl mb-6">📁✂️</div>
          <p className="text-center text-gray-600 mb-6 max-w-xs">
            Use Shortcuts to save reports, tasks, and external links here.
          </p>
          <button className="px-6 py-2.5 rounded-full bg-[#0875E1] text-white font-semibold hover:bg-[#0866c4] flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add Shortcuts
          </button>
        </div>
      )}
    </div>
  );
}

function SearchDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white animate-in fade-in duration-150" data-testid="search-drawer">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 border border-[#0875E1] rounded-md px-3 h-12">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              autoFocus
              type="search"
              className="flex-1 outline-none text-base bg-transparent"
              placeholder=""
            />
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="mt-6 px-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Recent Searches</h3>
            <button className="text-[#0875E1] font-medium">Clear</button>
          </div>
          <div className="space-y-1">
            {["Priya Patel", "Rahul Gupta", "Sneha Singh", "Vikram Nair", "Arjun Sharma"].map((name) => (
              <div key={name} className="flex items-center gap-3 py-3 text-gray-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span className="italic">{name}</span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-semibold text-gray-800 mt-6 mb-3">I'm looking for...</h3>
          <div className="flex flex-wrap gap-3">
            {["People", "Tasks and Reports", "Drive"].map((p) => (
              <button key={p} className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 font-medium hover:bg-gray-50">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileDrawer({
  onClose,
  onNavigate,
  onLogout,
  user,
  unreadCount,
  notifications,
  onMarkAllRead,
  onMarkRead,
}: any) {
  const [view, setView] = useState<"main" | "notifications" | "account">("main");

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-150" data-testid="profile-drawer">
      <div className="flex items-center justify-end px-4 h-14">
        {view !== "main" ? (
          <button onClick={() => setView("main")} className="mr-auto p-2 -ml-2 rounded hover:bg-gray-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
        ) : null}
        {view !== "main" && (
          <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900">
            {view === "notifications" ? "Notifications" : "My Account"}
          </h2>
        )}
        <button onClick={onClose} className="p-2 -mr-2 rounded hover:bg-gray-100">
          <X className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {view === "main" && (
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col items-center pt-2 pb-6 px-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-3 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{user?.name}</h2>
            <button
              onClick={() => onNavigate("/profile")}
              className="px-6 py-2 rounded-full border border-[#0875E1] text-[#0875E1] font-semibold hover:bg-blue-50"
            >
              View Profile
            </button>
          </div>

          <div className="border-t border-gray-100">
            <DrawerLink Icon={Home} label="Home" onClick={() => onNavigate("/dashboard")} />
            <DrawerLink Icon={User} label="My Account" rightIcon={<ChevronRight className="w-5 h-5 text-gray-400" />} onClick={() => setView("account")} />
            <DrawerLink Icon={Inbox} label="My Tasks" badge={3} onClick={() => onNavigate("/tasks")} />
            <DrawerLink Icon={Bell} label="Notifications" badge={unreadCount} onClick={() => setView("notifications")} />
            <DrawerLink Icon={Star} label="Favorites" onClick={() => onNavigate("/dashboard")} />
            <DrawerLink Icon={FileText} label="My Reports" onClick={() => onNavigate("/analytics")} />
            <DrawerLink Icon={HelpCircle} label="Documentation" rightIcon={<ExternalLink className="w-4 h-4 text-gray-400" />} onClick={() => {}} />
          </div>

          <div className="mt-auto flex justify-center pb-8 pt-6">
            <button
              onClick={onLogout}
              className="px-8 py-2 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {view === "account" && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-200">
            <span className="text-gray-800 font-medium">Organization ID</span>
            <span className="ml-2 text-xs text-[#0875E1] border border-[#0875E1] rounded px-1.5 py-0.5">Selected</span>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 text-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0875E1" strokeWidth="1.8"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
            <span className="text-gray-800">Change Preferences</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 text-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0875E1" strokeWidth="1.8"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
            <span className="text-gray-800">Change Public Profile Preferences</span>
          </button>
        </div>
      )}

      {view === "notifications" && (
        <div className="flex-1 overflow-y-auto">
          {unreadCount > 0 && (
            <div className="px-5 py-3 flex justify-end border-b border-gray-100">
              <button onClick={onMarkAllRead} className="text-[#0875E1] text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Mark all read
              </button>
            </div>
          )}
          {!notifications?.length ? (
            <p className="text-center text-gray-500 py-12">No notifications.</p>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => !n.read && onMarkRead(n.id)}
                className={`px-5 py-4 border-b border-gray-100 cursor-pointer ${!n.read ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-[#0875E1] mt-1.5 shrink-0" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DrawerLink({
  Icon,
  label,
  onClick,
  badge,
  rightIcon,
}: {
  Icon: any;
  label: string;
  onClick: () => void;
  badge?: number;
  rightIcon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 text-left border-b border-gray-50"
    >
      <Icon className="w-6 h-6 text-gray-700" strokeWidth={1.8} />
      <span className="flex-1 text-gray-900 text-base">{label}</span>
      {!!badge && badge > 0 && (
        <span className="min-w-[22px] h-[22px] px-1.5 bg-[#E53935] rounded-full text-[11px] text-white flex items-center justify-center font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {rightIcon}
    </button>
  );
}
