import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import dejoiyLogo from "@assets/IMG-20260506-WA0001_1779996360464.jpg";
import {
  X, Search, Bell, Home, User, Inbox, FileText, HelpCircle,
  Briefcase, Mail, BarChart3, Wallet, Users,
  ChevronRight, Check, Sparkles, Plus, LogOut, Settings,
  Calendar, Clock, Receipt, Monitor, Target, Shield, Keyboard,
  ChevronDown, ExternalLink, MessageSquare, BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListNotifications,
  useListTasks,
  useListUsers,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EnterpriseNav } from "@/components/layout/enterprise-nav";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QUICK_ACTIONS_BY_ROLE: Record<string, { label: string; path: string; icon: React.ComponentType<any> }[]> = {
  employee: [
    { label: "Request Time Off", path: "/time-off", icon: Calendar },
    { label: "Submit Expense", path: "/expenses", icon: Receipt },
    { label: "Log Timesheet", path: "/timesheets", icon: Clock },
    { label: "IT Request", path: "/it-help", icon: Monitor },
    { label: "View Payslip", path: "/payroll", icon: Wallet },
  ],
  manager: [
    { label: "Approve Requests", path: "/approvals", icon: Check },
    { label: "View Team", path: "/manager", icon: Users },
    { label: "Create Goal", path: "/performance", icon: Target },
    { label: "Start Hiring", path: "/recruitment", icon: Briefcase },
    { label: "Team Analytics", path: "/analytics", icon: BarChart3 },
  ],
  admin: [
    { label: "Approve Requests", path: "/approvals", icon: Check },
    { label: "Manage People", path: "/people", icon: Users },
    { label: "System Settings", path: "/analytics", icon: Settings },
    { label: "Audit Logs", path: "/analytics", icon: Shield },
    { label: "Workflows", path: "/approvals", icon: FileText },
  ],
  hr: [
    { label: "People Directory", path: "/people", icon: Users },
    { label: "Recruitment", path: "/recruitment", icon: Briefcase },
    { label: "Performance", path: "/performance", icon: Target },
    { label: "Approvals", path: "/approvals", icon: Check },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
  ],
};

const SEARCH_PAGES = [
  { label: "Home", path: "/home", icon: Home },
  { label: "People Directory", path: "/people", icon: Users },
  { label: "My Tasks", path: "/tasks", icon: FileText },
  { label: "Approvals", path: "/approvals", icon: Check },
  { label: "Recruitment", path: "/recruitment", icon: Briefcase },
  { label: "Performance", path: "/performance", icon: Target },
  { label: "Timesheets", path: "/timesheets", icon: Clock },
  { label: "Time Off", path: "/time-off", icon: Calendar },
  { label: "Payroll", path: "/payroll", icon: Wallet },
  { label: "Expenses", path: "/expenses", icon: Receipt },
  { label: "IT Help", path: "/it-help", icon: Monitor },
  { label: "Assets", path: "/assets", icon: Briefcase },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Calendar", path: "/calendar", icon: Calendar },
  { label: "Org Chart", path: "/org-chart", icon: Users },
  { label: "Announcements", path: "/announcements", icon: Mail },
  { label: "My Profile", path: "/profile", icon: User },
  { label: "Manager Workspace", path: "/manager", icon: Users },
];export function AppShell({
  children,
  onOpenCommand,
  onOpenAi,
}: {
  children: React.ReactNode;
  onOpenCommand?: () => void;
  onOpenAi?: () => void;
}) {
  const [location] = useLocation();
  const isHome = location === "/home";
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const { data: notifications } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const notifsArr = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notifsArr.filter((n) => !n.read).length || 0;

  const userRole = user?.role || "employee";
  const quickActions = QUICK_ACTIONS_BY_ROLE[userRole] || QUICK_ACTIONS_BY_ROLE.employee;

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  // Global ⌘K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <SidebarProvider>
      <EnterpriseNav />
      <div className="min-h-screen bg-[#F2F2F2] dark:bg-zinc-950 text-gray-900 dark:text-white flex flex-col flex-1 transition-colors">
        {/* Global Header */}
        <header className="bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl h-14 flex items-center justify-between px-4 md:px-5 sticky top-0 z-30 border-b border-gray-100 dark:border-white/5 transition-colors">
          {/* Left: Sidebar trigger */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg p-1.5 transition-colors" />
          </div>

          {/* Center: Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 h-9 px-3 rounded-lg bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 text-sm text-gray-500 dark:text-gray-400 transition-colors"
              data-testid="open-command-palette"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Search people, tasks, requests...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded border border-gray-200 dark:border-white/10">⌘K</kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-0.5">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Search"
              data-testid="open-search"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Quick Action */}
            <DropdownMenu open={quickActionOpen} onOpenChange={setQuickActionOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Quick actions"
                  data-testid="quick-action-btn"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</div>
                <DropdownMenuSeparator />
                {quickActions.map((action) => (
                  <DropdownMenuItem key={action.path + action.label} onClick={() => navigate(action.path)}>
                    <action.icon className="w-4 h-4 mr-2 text-gray-500" />
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setHelpOpen(false); }}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Notifications"
                data-testid="notifications-btn"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationPanel
                  notifications={notifsArr}
                  unreadCount={unreadCount}
                  onClose={() => setNotifOpen(false)}
                  onMarkAllRead={() => markAllRead.mutate()}
                  onMarkRead={(id: number) => markRead.mutate(id)}
                  onNavigate={(path: string) => { navigate(path); setNotifOpen(false); }}
                />
              )}
            </div>

            {/* Help */}
            <div className="relative">
              <button
                onClick={() => { setHelpOpen(!helpOpen); setNotifOpen(false); }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Help"
                data-testid="help-btn"
              >
                <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              {helpOpen && (
                <HelpMenu onClose={() => setHelpOpen(false)} onNavigate={(path: string) => { navigate(path); setHelpOpen(false); }} />
              )}
            </div>

            {/* AI Assistant */}
            {onOpenAi && (
              <button
                onClick={onOpenAi}
                className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                aria-label="AI Assistant"
                data-testid="open-ai"
              >
                <Sparkles className="w-5 h-5 text-violet-500" strokeWidth={2} />
              </button>
            )}

            <ThemeToggle />

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ml-1"
                  data-testid="profile-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) ?? "U"
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.jobTitle || user?.role}</p>
                  {user?.department && <p className="text-xs text-gray-400 truncate">{user.department}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/tasks")}>
                  <FileText className="w-4 h-4 mr-2" /> My Tasks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/approvals")}>
                  <Check className="w-4 h-4 mr-2" /> My Approvals
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(userRole === "admin" || userRole === "hr") && (
                  <DropdownMenuItem onClick={() => navigate("/analytics")}>
                    <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={`flex-1 w-full ${isHome ? "" : "p-4 md:p-6 lg:p-8"}`}>{children}</main>

        {/* Global Search Overlay */}
        {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} onNavigate={(path) => { navigate(path); setSearchOpen(false); }} user={user} />}
      </div>
    </SidebarProvider>
  );
}

/* ═══════════════════════════════════════════
   Global Search Overlay
   ═══════════════════════════════════════════ */
function GlobalSearch({
  onClose,
  onNavigate,
  user,
}: {
  onClose: () => void;
  onNavigate: (path: string) => void;
  user: any;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: usersRaw } = useListUsers();
  const users = Array.isArray(usersRaw) ? usersRaw : [];

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Filter pages + people
  const pageResults = SEARCH_PAGES.filter(p =>
    !query || p.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const peopleResults = query.length >= 2
    ? users.filter(u =>
        (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const allResults = [
    ...pageResults.map(p => ({ type: "page" as const, label: p.label, path: p.path, icon: p.icon })),
    ...peopleResults.map(p => ({ type: "person" as const, label: p.name, path: `/people/${p.id}`, icon: User, subtitle: p.jobTitle || p.department })),
  ];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      onNavigate(allResults[selectedIndex].path);
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [allResults, selectedIndex, onNavigate, onClose]);

  return (
    <div className="fixed inset-0 z-50" data-testid="global-search">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 dark:border-white/10">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search people, tasks, requests, reports..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/5 rounded border border-gray-200 dark:border-white/10">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query && (
            <div className="px-4 py-2.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pages</p>
            </div>
          )}
          {query.length >= 2 && peopleResults.length > 0 && (
            <div className="px-4 py-2.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">People</p>
            </div>
          )}
          {allResults.length === 0 && query.length >= 2 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}
          {allResults.map((result, i) => (
            <button
              key={result.path + result.label}
              onClick={() => onNavigate(result.path)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === selectedIndex ? "bg-gray-100 dark:bg-white/5" : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              }`}
            >
              <result.icon className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white truncate">{result.label}</p>
                {result.subtitle && <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>}
              </div>
              {result.type === "person" && <Badge variant="secondary" className="text-[10px]">Employee</Badge>}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-white/10 flex items-center gap-4 text-[11px] text-gray-400">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Notification Panel
   ═══════════════════════════════════════════ */
function NotificationPanel({
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onMarkRead,
  onNavigate,
}: {
  notifications: any[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: number) => void;
  onNavigate: (path: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
      data-testid="notification-panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
                if (n.entityType && n.entityId) {
                  const paths: Record<string, string> = {
                    leave_request: "/time-off",
                    expense: "/expenses",
                    task: "/tasks",
                    approval: "/approvals",
                    announcement: "/announcements",
                  };
                  onNavigate(paths[n.entityType] || "/home");
                }
              }}
              className={`px-4 py-3 border-b border-gray-50 dark:border-white/5 cursor-pointer transition-colors ${
                !n.read ? "bg-blue-50/40 dark:bg-blue-500/5 hover:bg-blue-50/60" : "hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10 text-center">
          <button onClick={() => onNavigate("/home")} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Help Menu
   ═══════════════════════════════════════════ */
function HelpMenu({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (path: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { label: "Help Center", icon: BookOpen, action: () => {} },
    { label: "Contact HR", icon: Mail, action: () => onNavigate("/it-help") },
    { label: "Contact IT", icon: Monitor, action: () => onNavigate("/it-help") },
    { label: "Keyboard Shortcuts", icon: Keyboard, action: () => {} },
  ];

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
      data-testid="help-menu"
    >
      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Help</p>
      </div>
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <item.icon className="w-4 h-4 text-gray-500" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
