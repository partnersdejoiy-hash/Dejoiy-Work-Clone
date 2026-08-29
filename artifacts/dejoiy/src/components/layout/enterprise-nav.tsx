import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home, Users, Briefcase, Clock, DollarSign, Receipt, BarChart3,
  Monitor, Settings, Bell, CheckCircle, FileText, Target,
  Calendar, MapPin, GraduationCap, Shield, ChevronDown,
  Sparkles, LogOut, Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: number;
  roles?: string[]; // if specified, only these roles see this item
}

interface NavGroup {
  label: string;
  items: NavItem[];
  roles?: string[];
}

// Navigation structure — role-aware, progressive disclosure
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Home",
    items: [
      { label: "My Home", path: "/home", icon: Home },
      { label: "Approvals", path: "/approvals", icon: CheckCircle },
      { label: "My Tasks", path: "/tasks", icon: FileText },
      { label: "Manager", path: "/manager", icon: Users, roles: ["admin", "manager", "hr"] },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Directory", path: "/people", icon: Users },
      { label: "Org Chart", path: "/org-chart", icon: MapPin },
    ],
    roles: ["admin", "hr", "hr_admin", "manager"],
  },
  {
    label: "Talent",
    items: [
      { label: "Recruiting", path: "/recruitment", icon: Briefcase },
      { label: "Performance", path: "/performance", icon: Target },
    ],
  },
  {
    label: "Time & Absence",
    items: [
      { label: "Timesheets", path: "/timesheets", icon: Clock },
      { label: "Time Off", path: "/time-off", icon: Calendar },
    ],
  },
  {
    label: "Pay & Expenses",
    items: [
      { label: "Payroll", path: "/payroll", icon: DollarSign },
      { label: "Expenses", path: "/expenses", icon: Receipt },
    ],
  },
  {
    label: "Workplace",
    items: [
      { label: "IT Requests", path: "/it-help", icon: Monitor },
      { label: "Assets", path: "/assets", icon: Briefcase },
      { label: "Announcements", path: "/announcements", icon: Bell },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ],
    roles: ["admin", "hr", "hr_admin", "manager", "finance"],
  },
];

export function EnterpriseNav() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { state } = useSidebar();

  const userRoles = user?.role ? [user.role] : [];

  const filteredGroups = NAV_GROUPS.filter(group => {
    if (group.roles) {
      return group.roles.some(r => userRoles.includes(r));
    }
    return true;
  });

  const isActive = (path: string) => location === path;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <Link href="/home" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#F26522] flex items-center justify-center text-white text-sm font-black shrink-0">
            D
          </div>
          {state === "expanded" && (
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white truncate">
              Dejoiy
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {filteredGroups.map((group, groupIdx) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={item.label}
                    >
                      <Link href={item.path}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge variant="secondary" className="ml-auto bg-[#F26522] text-white text-[10px] min-w-[18px] h-[18px] px-1">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white text-xs font-bold">
                      {user?.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.jobTitle || user?.role}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Users className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
