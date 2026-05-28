import { useState } from "react";
import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function OrgChart() {
  const { data: users } = useListUsers();
  const [search, setSearch] = useState("");

  const ceo = users?.find(u => u.role === 'admin') || users?.[0];
  const managers = users?.filter(u => u.role === 'manager' && u.id !== ceo?.id) || [];
  const employees = users?.filter(u => u.role === 'employee') || [];

  const filteredUsers = search ? users?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.department?.toLowerCase().includes(search.toLowerCase()) ||
    u.jobTitle?.toLowerCase().includes(search.toLowerCase())
  ) : null;

  const isHighlighted = (id: number) => {
    if (!search) return false;
    return filteredUsers?.some(u => u.id === id);
  };

  const Node = ({ user, isHighlight }: { user: any, isHighlight: boolean }) => {
    if (!user) return null;
    return (
      <div className={`relative flex flex-col items-center transition-all ${isHighlight ? 'scale-105 z-10' : ''}`}>
        <Card className={`w-48 shadow-sm ${isHighlight ? 'ring-2 ring-[#F26522] border-transparent shadow-lg' : 'border-gray-200'}`}>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${user.role === 'admin' ? 'bg-[#0E1B4D]' : user.role === 'manager' ? 'bg-[#F26522]' : 'bg-gray-400'}`}>
              {user.name.charAt(0)}
            </div>
            <h3 className="font-bold text-sm text-[#0E1B4D] leading-tight mb-1">{user.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{user.jobTitle || 'Employee'}</p>
            {user.department && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{user.department}</Badge>}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0E1B4D]">Organization Chart</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Find an employee..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-x-auto min-h-[600px] flex justify-center pt-12">
        {users ? (
          <div className="flex flex-col items-center">
            {/* CEO Level */}
            <div className="relative">
              <Node user={ceo} isHighlight={isHighlighted(ceo?.id)} />
              {managers.length > 0 && (
                <div className="absolute left-1/2 bottom-[-40px] w-px h-10 bg-gray-300" />
              )}
            </div>

            {/* Managers Level */}
            {managers.length > 0 && (
              <div className="mt-10 relative flex justify-center gap-16 before:content-[''] before:absolute before:top-[-40px] before:left-1/2 before:-translate-x-1/2 before:w-[calc(100%-12rem)] before:h-px before:bg-gray-300">
                {managers.map((manager, i) => {
                  // Distribute employees somewhat evenly among managers for visual demo
                  const team = employees.filter((_, idx) => idx % managers.length === i);
                  
                  return (
                    <div key={manager.id} className="flex flex-col items-center relative before:content-[''] before:absolute before:top-[-40px] before:left-1/2 before:w-px before:h-10 before:bg-gray-300">
                      <Node user={manager} isHighlight={isHighlighted(manager.id)} />
                      
                      {/* Team Level */}
                      {team.length > 0 && (
                        <div className="mt-10 relative flex justify-center gap-4 before:content-[''] before:absolute before:top-[-40px] before:left-1/2 before:-translate-x-1/2 before:w-[calc(100%-12rem)] before:h-px before:bg-gray-300">
                          <div className="absolute left-1/2 top-[-40px] w-px h-10 bg-gray-300" />
                          {team.map(emp => (
                            <div key={emp.id} className="relative before:content-[''] before:absolute before:top-[-40px] before:left-1/2 before:w-px before:h-10 before:bg-gray-300">
                              <Node user={emp} isHighlight={isHighlighted(emp.id)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Loading org chart...</div>
        )}
      </div>
    </div>
  );
}
