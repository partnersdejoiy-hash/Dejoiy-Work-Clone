import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users, MapPin, MoreHorizontal, ChevronRight, X } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateUser = useUpdateUser();

  const [editOpen, setEditOpen] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({ id: user.id, data: formData });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Profile updated successfully" });
      setEditOpen(false);
    } catch {
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  };

  const employeeId = String(3352000 + user.id);
  const hireDate = new Date(user.createdAt).toLocaleDateString("en-US");
  const monthsOfService = Math.max(0, monthsBetween(new Date(user.createdAt), new Date()));
  const years = Math.floor(monthsOfService / 12);
  const months = monthsOfService % 12;
  const tenure = `${years} year(s), ${months} month(s)`;

  const sections = [
    { label: "Overview", id: "overview" },
    { label: "Job", id: "job" },
    { label: "Personal", id: "personal" },
    { label: "Compensation", id: "compensation" },
  ];
  const moreSections = [
    { label: "Performance", id: "performance" },
    { label: "Time Off", id: "timeoff" },
    { label: "Benefits", id: "benefits" },
    { label: "Education", id: "education" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F2] pb-12">
      {/* Blue curved header */}
      <div className="relative bg-[#0875E1] h-44 md:h-52">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M 0 80 Q 720 0 1440 80 L 1440 80 L 0 80 Z" fill="#F2F2F2" />
        </svg>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 z-10">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="profile-name">{user.name}</h1>
        <p className="text-gray-600 mt-1">{user.jobTitle || "Teammate"}</p>

        <button
          onClick={() => setEditOpen(true)}
          className="mt-4 px-6 py-1.5 rounded-full border border-gray-400 text-gray-800 font-medium hover:bg-gray-50 inline-flex items-center gap-1.5"
        >
          Actions <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex justify-center gap-8 mt-6">
          <a href={`mailto:${user.email}`} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <Mail className="w-5 h-5 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700">Email</span>
          </a>
          <a href="/org-chart" className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              <Users className="w-5 h-5 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700">Team</span>
          </a>
        </div>

        {/* Sections list */}
        <div className="mt-8 bg-transparent text-left">
          {sections.map((s) => (
            <SectionRow key={s.id} label={s.label} />
          ))}
          {showAllSections &&
            moreSections.map((s) => <SectionRow key={s.id} label={s.label} />)}
          {!showAllSections && (
            <div className="text-center py-3">
              <button
                onClick={() => setShowAllSections(true)}
                className="text-[#0875E1] underline font-medium"
              >
                More ({moreSections.length})
              </button>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-4 mt-4 text-left">
          <InfoCard>
            <InfoRow icon={<MapPin className="w-5 h-5 text-gray-600" />} label="Location" value={user.location || "IND - Gurugram - Mystiqa"} valueLink />
            <InfoRow
              icon={
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
              }
              label="Manager"
              value="Gautam Chhabra"
              valueLink
            />
            <InfoRow
              icon={<Mail className="w-5 h-5 text-gray-600" />}
              label="Primary Work Email"
              value={user.email}
            />
          </InfoCard>

          <InfoCard title="Job Details">
            <Field label="Employee ID" value={employeeId} />
            <Field
              label="Supervisory Organization"
              value="Dejoiy (Bryce Maddock) >> Gautam Chhabra Teammates"
              link
            />
            <Field label="Job" value={`P${employeeId} ${user.jobTitle || "Teammate"}`} />
            <Field label="Business Title" value={user.jobTitle || "Teammate"} />
            <Field label="Job Profile" value={user.jobTitle || "Teammate"} />
            <Field label="Job Family" value={`${user.department} > ${user.department} - Operations`} />
            <Field label="Employee Type" value="Regular" />
            <Field label="Management Level" value={`S${user.role === "admin" ? 5 : user.role === "manager" ? 3 : 1} - ${user.jobTitle || "Teammate"}`} />
            <Field label="Time Type" value="Full time" />
            <Field label="FTE" value="100.00%" />
            <Field label="Location" value={user.location || "IND - Gurugram - Mystiqa"} link />
            <Field label="Hire Date" value={hireDate} />
            <Field label="Original Hire Date" value={hireDate} />
            <Field label="Continuous Service Date" value={hireDate} />
            <Field label="Length of Service" value={tenure} />
            <Field label="Time in Position" value={tenure} />
            <Field label="Time in Job Profile" value={tenure} />
          </InfoCard>

          <InfoCard title="Contact Information - Public">
            <Field label="Email" value={user.email} link icon={<Mail className="w-4 h-4" />} />
            <Field
              label="Work Address"
              value="Dejoiy HQ, 4th Floor, 404-405 iLABS Centre, near Radisson Hotel, Phase III, Udyog Vihar, Gurugram- 122016 Haryana India"
              link
              icon={<MapPin className="w-4 h-4" />}
            />
          </InfoCard>

          <InfoCard title="Job History">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-[#0875E1] font-semibold underline">{user.jobTitle || "Teammate"}</p>
                <button className="px-4 py-1 rounded-full border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-50 inline-flex items-center gap-1">
                  Edit <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {user.department} | {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })} - Present | {tenure} | {user.location || "Gurugram"}
              </p>
            </div>
            <button className="mt-4 text-[#0875E1] underline font-medium">Add Job History</button>
          </InfoCard>

          <InfoCard title="Upcoming Absences">
            <p className="text-gray-700">No upcoming absences in the next 30 days.</p>
          </InfoCard>

          <InfoCard title="Skills">
            <div className="flex flex-wrap gap-2">
              {["Excel", "PowerPoint", "SQL", "English", "Hindi", "Problem Solving", "Communication"].map((s) => (
                <span key={s} className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-800">
                  {s}
                </span>
              ))}
            </div>
            <button className="mt-4 text-[#0875E1] underline font-medium">Edit Skills</button>
          </InfoCard>
        </div>
      </div>

      {/* Edit Drawer */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-center" onClick={() => setEditOpen(false)}>
          <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0875E1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0875E1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0875E1]"
                />
              </div>
              <button
                type="submit"
                disabled={updateUser.isPending}
                className="w-full px-6 py-2.5 rounded-full bg-[#0875E1] hover:bg-[#0866c4] text-white font-semibold"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionRow({ label }: { label: string }) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-gray-200 cursor-pointer hover:bg-white/50 px-1">
      <span className="text-gray-900 text-base">{label}</span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}

function InfoCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {title && <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, valueLink }: { icon: React.ReactNode; label: string; value: string; valueLink?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className={`mt-0.5 ${valueLink ? "text-[#0875E1] underline" : "text-gray-700"}`}>{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, link, icon }: { label: string; value: string; link?: boolean; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-900">{label}</p>
      <p className={`mt-1 flex items-start gap-1.5 ${link ? "text-[#0875E1] underline" : "text-gray-700"}`}>
        {icon && <span className="mt-0.5 text-gray-500">{icon}</span>}
        <span>{value}</span>
      </p>
    </div>
  );
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
