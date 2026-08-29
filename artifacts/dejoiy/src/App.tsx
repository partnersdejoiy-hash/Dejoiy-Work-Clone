import { useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";
import { AiAssistant } from "@/components/ai-assistant";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Approvals from "@/pages/approvals";
import ManagerWorkspace from "@/pages/manager-workspace";
import People from "@/pages/people";
import EmployeeProfile from "@/pages/employee-profile";
import Tasks from "@/pages/task-center";
import TimeOff from "@/pages/time-off";
import Expenses from "@/pages/expenses";
import ItHelp from "@/pages/it-help";
import Announcements from "@/pages/announcements";
import Profile from "@/pages/profile";
import Analytics from "@/pages/analytics";
import Performance from "@/pages/performance";
import Payroll from "@/pages/payroll";
import Recruitment from "@/pages/recruitment";
import Timesheets from "@/pages/timesheets";
import Calendar from "@/pages/calendar";
import OrgChart from "@/pages/org-chart";
import Assets from "@/pages/assets";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, openCmd, openAi, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <AppShell onOpenCommand={openCmd} onOpenAi={openAi}>
      <Component {...rest} />
    </AppShell>
  );
}

function Router({ openCmd, openAi }: { openCmd: () => void; openAi: () => void }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/home" /> : <Login />}
      </Route>
      <Route path="/">
        {user ? <Redirect to="/home" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/home"><ProtectedRoute component={Home} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/approvals"><ProtectedRoute component={Approvals} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/manager"><ProtectedRoute component={ManagerWorkspace} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/analytics"><ProtectedRoute component={Analytics} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/people"><ProtectedRoute component={People} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/people/:id"><ProtectedRoute component={EmployeeProfile} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/people/:id/:tab"><ProtectedRoute component={EmployeeProfile} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/performance"><ProtectedRoute component={Performance} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/payroll"><ProtectedRoute component={Payroll} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/recruitment"><ProtectedRoute component={Recruitment} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/tasks"><ProtectedRoute component={Tasks} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/timesheets"><ProtectedRoute component={Timesheets} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/time-off"><ProtectedRoute component={TimeOff} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/calendar"><ProtectedRoute component={Calendar} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/org-chart"><ProtectedRoute component={OrgChart} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/expenses"><ProtectedRoute component={Expenses} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/assets"><ProtectedRoute component={Assets} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/it-help"><ProtectedRoute component={ItHelp} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/announcements"><ProtectedRoute component={Announcements} openCmd={openCmd} openAi={openAi} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} openCmd={openCmd} openAi={openAi} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppShellLayer() {
  const { user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);

  const askAi = (q: string) => {
    setAiPrompt(q);
    setAiOpen(true);
  };

  return (
    <>
      <Router openCmd={() => setCmdOpen(true)} openAi={() => setAiOpen(true)} />
      {user && (
        <>
          <CommandPalette
            open={cmdOpen}
            onOpenChange={setCmdOpen}
            onAskAi={askAi}
          />
          <AiAssistant
            open={aiOpen}
            onOpenChange={setAiOpen}
            initialPrompt={aiPrompt}
            onPromptConsumed={() => setAiPrompt(null)}
          />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <AppShellLayer />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
