import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, CheckSquare, Calendar, 
  Receipt, Laptop, Megaphone, LogOut, Bell, Menu, X, Check
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/people", label: "People", icon: Users },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/time-off", label: "Time Off", icon: Calendar },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/it-help", label: "IT Help", icon: Laptop },
  { path: "/announcements", label: "Announcements", icon: Megaphone },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: notifications } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleLogout = async () => {
    await logout();
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    } catch(e) {}
  };

  const handleNotificationClick = async (id: number) => {
    try {
      await markRead.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    } catch(e) {}
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0E1B4D] text-white flex flex-col
        transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F26522] rounded flex items-center justify-center text-white text-lg">D</div>
            Dejoiy
          </Link>
          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${location === item.path ? "bg-[#F26522] text-white font-medium shadow-md shadow-[#F26522]/20" : "text-gray-300 hover:bg-white/10 hover:text-white"}
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            href="/profile"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer mb-2"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
            </div>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-20">
          <div className="flex items-center">
            <button className="lg:hidden mr-4 p-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-[#0E1B4D] hidden md:block">
              {NAV_ITEMS.find(i => i.path === location)?.label || "Welcome"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#F26522] rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-[#0E1B4D]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-[#F26522] font-medium hover:underline flex items-center gap-1">
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {!notifications?.length ? (
                        <p className="text-center text-sm text-gray-500 py-4">No notifications.</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                            onClick={() => !n.read && handleNotificationClick(n.id)}
                          >
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${!n.read ? 'font-bold text-[#0E1B4D]' : 'font-medium text-gray-700'}`}>{n.title}</p>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-[#F26522] mt-1.5 shrink-0"></div>}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <Link href="/profile" className="hidden md:flex items-center gap-2 cursor-pointer p-1.5 pr-3 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#0E1B4D] flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}