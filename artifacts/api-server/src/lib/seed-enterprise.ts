import {
  db, usersTable, tasksTable, notificationsTable, leaveRequestsTable,
  expensesTable, itTicketsTable, announcementsTable, goalsTable,
  performanceReviewsTable, payrollTable, jobPostingsTable, applicationsTable,
  timesheetsTable, eventsTable, assetsTable,
  departmentsTable, rolesTable, permissionsTable, rolePermissionsTable,
  userRolesTable, approvalRequestsTable, approvalStepsTable, auditLogsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { logger } from "./logger";
import { eq } from "drizzle-orm";

const PASSWORD_HASH_CACHE = new Map<string, string>();
async function hashpw(pw: string): Promise<string> {
  if (!PASSWORD_HASH_CACHE.has(pw)) {
    PASSWORD_HASH_CACHE.set(pw, await bcrypt.hash(pw, 10));
  }
  return PASSWORD_HASH_CACHE.get(pw)!;
}

// ─── Permission definitions ───────────────────────────────────────────
const PERMISSIONS = [
  // Employee
  { code: "employee.profile.view", module: "employee", action: "view" },
  { code: "employee.profile.edit", module: "employee", action: "edit" },
  { code: "employee.list", module: "employee", action: "view" },
  { code: "employee.create", module: "employee", action: "create" },
  { code: "employee.delete", module: "employee", action: "delete" },
  // Leave
  { code: "leave.request", module: "leave", action: "create" },
  { code: "leave.approve", module: "leave", action: "approve" },
  { code: "leave.view_all", module: "leave", action: "view" },
  // Expense
  { code: "expense.submit", module: "expense", action: "create" },
  { code: "expense.approve", module: "expense", action: "approve" },
  { code: "expense.view_all", module: "expense", action: "view" },
  // Payroll
  { code: "payroll.view", module: "payroll", action: "view" },
  { code: "payroll.view_all", module: "payroll", action: "view" },
  { code: "payroll.admin", module: "payroll", action: "admin" },
  // Performance
  { code: "performance.review", module: "performance", action: "edit" },
  { code: "performance.view_team", module: "performance", action: "view" },
  // Recruiting
  { code: "recruiting.manage", module: "recruiting", action: "admin" },
  { code: "recruiting.view", module: "recruiting", action: "view" },
  // Timesheet
  { code: "timesheet.submit", module: "timesheet", action: "create" },
  { code: "timesheet.approve", module: "timesheet", action: "approve" },
  // Tasks
  { code: "task.assign", module: "task", action: "edit" },
  { code: "task.view_team", module: "task", action: "view" },
  // IT
  { code: "it.manage", module: "it", action: "admin" },
  { code: "it.request", module: "it", action: "create" },
  // Assets
  { code: "asset.manage", module: "asset", action: "admin" },
  // Announcements
  { code: "announcement.create", module: "announcement", action: "create" },
  // Analytics
  { code: "analytics.view", module: "analytics", action: "view" },
  { code: "analytics.admin", module: "analytics", action: "admin" },
  // Admin
  { code: "admin.users", module: "admin", action: "admin" },
  { code: "admin.roles", module: "admin", action: "admin" },
  { code: "admin.audit", module: "admin", action: "view" },
  { code: "admin.settings", module: "admin", action: "admin" },
  { code: "workflow.admin", module: "workflow", action: "admin" },
];

// ─── Role → Permission mappings ───────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  employee: [
    "employee.profile.view", "employee.profile.edit",
    "leave.request", "expense.submit",
    "timesheet.submit", "task.view_team",
    "it.request", "payroll.view", "performance.view_team",
  ],
  manager: [
    "employee.profile.view", "employee.profile.edit", "employee.list",
    "leave.request", "leave.approve", "leave.view_all",
    "expense.submit", "expense.approve", "expense.view_all",
    "timesheet.submit", "timesheet.approve",
    "task.assign", "task.view_team",
    "performance.review", "performance.view_team",
    "payroll.view", "recruiting.view",
    "analytics.view", "announcement.create",
  ],
  hr: [
    "employee.profile.view", "employee.profile.edit", "employee.list", "employee.create",
    "leave.request", "leave.approve", "leave.view_all",
    "expense.view_all",
    "timesheet.approve",
    "task.view_team",
    "performance.review", "performance.view_team",
    "payroll.view", "payroll.view_all",
    "recruiting.manage", "recruiting.view",
    "analytics.view", "announcement.create",
  ],
  admin: Object.keys(PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.code]: true }), {} as Record<string, boolean>)),
  payroll_admin: ["payroll.view", "payroll.view_all", "payroll.admin"],
  recruiter: ["recruiting.manage", "recruiting.view", "employee.list", "employee.profile.view"],
  finance: ["expense.approve", "expense.view_all", "payroll.view", "payroll.view_all", "analytics.view"],
  it_admin: ["it.manage", "asset.manage", "employee.list"],
};

// ─── Departments ──────────────────────────────────────────────────────
const DEPARTMENTS = [
  { name: "Executive", code: "EXEC", costCenter: "CC-000" },
  { name: "Engineering", code: "ENG", costCenter: "CC-100" },
  { name: "Product", code: "PROD", costCenter: "CC-200" },
  { name: "Design", code: "DES", costCenter: "CC-210" },
  { name: "HR", code: "HR", costCenter: "CC-300" },
  { name: "Finance", code: "FIN", costCenter: "CC-400" },
  { name: "Sales", code: "SALES", costCenter: "CC-500" },
  { name: "Marketing", code: "MKT", costCenter: "CC-600" },
  { name: "Operations", code: "OPS", costCenter: "CC-700" },
  { name: "IT", code: "IT", costCenter: "CC-800" },
  { name: "Legal", code: "LEGAL", costCenter: "CC-900" },
];

// ─── Employees ────────────────────────────────────────────────────────
interface EmployeeSeed {
  name: string;
  email: string;
  role: string;     // RBAC role name
  department: string;
  jobTitle: string;
  location: string;
  hireDate: string;
  phone: string;
}

const EMPLOYEES: EmployeeSeed[] = [
  // Executive
  { name: "Arjun Sharma", email: "admin@dejoiy.com", role: "admin", department: "Executive", jobTitle: "CEO", location: "Mumbai", hireDate: "2022-01-15", phone: "+91 98765 43210" },
  { name: "Deepa Nair", email: "deepa@dejoiy.com", role: "admin", department: "Executive", jobTitle: "CTO", location: "Mumbai", hireDate: "2022-03-01", phone: "+91 98765 43211" },
  { name: "Vikram Mehta", email: "vikram.m@dejoiy.com", role: "admin", department: "Executive", jobTitle: "CFO", location: "Delhi", hireDate: "2022-06-01", phone: "+91 98765 43212" },

  // HR
  { name: "Priya Patel", email: "priya@dejoiy.com", role: "hr", department: "HR", jobTitle: "HR Director", location: "Mumbai", hireDate: "2022-04-15", phone: "+91 98765 43213" },
  { name: "Ananya Reddy", email: "ananya@dejoiy.com", role: "hr", department: "HR", jobTitle: "HR Manager", location: "Hyderabad", hireDate: "2023-01-10", phone: "+91 98765 43214" },
  { name: "Rohit Verma", email: "rohit@dejoiy.com", role: "hr", department: "HR", jobTitle: "HR Business Partner", location: "Mumbai", hireDate: "2023-06-01", phone: "+91 98765 43215" },
  { name: "Kavya Iyer", email: "kavya@dejoiy.com", role: "recruiter", department: "HR", jobTitle: "Technical Recruiter", location: "Bangalore", hireDate: "2024-02-15", phone: "+91 98765 43216" },

  // Engineering
  { name: "Rahul Gupta", email: "rahul@dejoiy.com", role: "manager", department: "Engineering", jobTitle: "Engineering Manager", location: "Bangalore", hireDate: "2022-07-01", phone: "+91 98765 43217" },
  { name: "Sneha Singh", email: "sneha@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "Senior Frontend Engineer", location: "Bangalore", hireDate: "2023-03-15", phone: "+91 98765 43218" },
  { name: "Aditya Kumar", email: "aditya@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "Senior Backend Engineer", location: "Pune", hireDate: "2023-05-01", phone: "+91 98765 43219" },
  { name: "Nisha Joshi", email: "nisha@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "Full Stack Engineer", location: "Bangalore", hireDate: "2023-09-01", phone: "+91 98765 43220" },
  { name: "Amit Deshmukh", email: "amit@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "DevOps Engineer", location: "Pune", hireDate: "2024-01-15", phone: "+91 98765 43221" },
  { name: "Pooja Malhotra", email: "pooja@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "QA Engineer", location: "Noida", hireDate: "2024-04-01", phone: "+91 98765 43222" },
  { name: "Karthik Rajan", email: "karthik@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "Junior Engineer", location: "Chennai", hireDate: "2025-01-15", phone: "+91 98765 43223" },
  { name: "Meera Chopra", email: "meera@dejoiy.com", role: "employee", department: "Engineering", jobTitle: "Junior Engineer", location: "Bangalore", hireDate: "2025-03-01", phone: "+91 98765 43224" },

  // Product
  { name: "Sanjay Pillai", email: "sanjay@dejoiy.com", role: "manager", department: "Product", jobTitle: "VP Product", location: "Mumbai", hireDate: "2022-08-01", phone: "+91 98765 43225" },
  { name: "Tanya Bose", email: "tanya@dejoiy.com", role: "employee", department: "Product", jobTitle: "Senior Product Manager", location: "Mumbai", hireDate: "2023-04-01", phone: "+91 98765 43226" },
  { name: "Ravi Shankar", email: "ravi@dejoiy.com", role: "employee", department: "Product", jobTitle: "Product Analyst", location: "Delhi", hireDate: "2024-06-01", phone: "+91 98765 43227" },

  // Design
  { name: "Ishita Das", email: "ishita@dejoiy.com", role: "employee", department: "Design", jobTitle: "Design Lead", location: "Mumbai", hireDate: "2023-02-01", phone: "+91 98765 43228" },
  { name: "Nitin Agarwal", email: "nitin@dejoiy.com", role: "employee", department: "Design", jobTitle: "UX Designer", location: "Bangalore", hireDate: "2024-03-01", phone: "+91 98765 43229" },

  // Finance
  { name: "Rajesh Tiwari", email: "rajesh@dejoiy.com", role: "finance", department: "Finance", jobTitle: "Finance Director", location: "Delhi", hireDate: "2022-05-01", phone: "+91 98765 43230" },
  { name: "Shruti Agnihotri", email: "shruti@dejoiy.com", role: "finance", department: "Finance", jobTitle: "Senior Accountant", location: "Delhi", hireDate: "2023-07-01", phone: "+91 98765 43231" },
  { name: "Vikram Nair", email: "vikram@dejoiy.com", role: "payroll_admin", department: "Finance", jobTitle: "Payroll Manager", location: "Mumbai", hireDate: "2023-01-15", phone: "+91 98765 43232" },

  // Sales
  { name: "Aakash Bhatia", email: "aakash@dejoiy.com", role: "manager", department: "Sales", jobTitle: "Sales Director", location: "Delhi", hireDate: "2022-09-01", phone: "+91 98765 43233" },
  { name: "Divya Kapoor", email: "divya@dejoiy.com", role: "employee", department: "Sales", jobTitle: "Senior Sales Executive", location: "Mumbai", hireDate: "2023-08-01", phone: "+91 98765 43234" },
  { name: "Mohit Sinha", email: "mohit@dejoiy.com", role: "employee", department: "Sales", jobTitle: "Sales Executive", location: "Bangalore", hireDate: "2024-05-01", phone: "+91 98765 43235" },
  { name: "Aisha Khan", email: "aisha@dejoiy.com", role: "employee", department: "Sales", jobTitle: "Sales Development Rep", location: "Hyderabad", hireDate: "2025-02-01", phone: "+91 98765 43236" },

  // Marketing
  { name: "Sunita Rao", email: "sunita@dejoiy.com", role: "manager", department: "Marketing", jobTitle: "Marketing Director", location: "Mumbai", hireDate: "2022-10-01", phone: "+91 98765 43237" },
  { name: "Varun Menon", email: "varun@dejoiy.com", role: "employee", department: "Marketing", jobTitle: "Content Strategist", location: "Bangalore", hireDate: "2023-11-01", phone: "+91 98765 43238" },
  { name: "Priyanka Das", email: "priyanka@dejoiy.com", role: "employee", department: "Marketing", jobTitle: "Growth Marketer", location: "Mumbai", hireDate: "2024-07-01", phone: "+91 98765 43239" },

  // Operations
  { name: "Suresh Menon", email: "suresh@dejoiy.com", role: "manager", department: "Operations", jobTitle: "Operations Manager", location: "Mumbai", hireDate: "2022-11-01", phone: "+91 98765 43240" },
  { name: "Pallavi Ghosh", email: "pallavi@dejoiy.com", role: "employee", department: "Operations", jobTitle: "Office Administrator", location: "Mumbai", hireDate: "2023-10-01", phone: "+91 98765 43241" },

  // IT
  { name: "Gaurav Saxena", email: "gaurav@dejoiy.com", role: "it_admin", department: "IT", jobTitle: "IT Manager", location: "Mumbai", hireDate: "2022-12-01", phone: "+91 98765 43242" },
  { name: "Neha Kulkarni", email: "neha@dejoiy.com", role: "employee", department: "IT", jobTitle: "Systems Administrator", location: "Pune", hireDate: "2023-09-15", phone: "+91 98765 43243" },

  // Legal
  { name: "Adv. Sameer Khan", email: "sameer@dejoiy.com", role: "manager", department: "Legal", jobTitle: "Legal Counsel", location: "Delhi", hireDate: "2023-03-01", phone: "+91 98765 43244" },
];

export async function seedEnterprise() {
  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    logger.info("Enterprise seed: users already exist, skipping full seed");
    return;
  }

  logger.info("Seeding enterprise data...");
  const pw = await hashpw("demo123");

  // ─── 1. Seed departments ──────────────────────────────────────────
  const deptMap = new Map<string, number>();
  for (const dept of DEPARTMENTS) {
    const [row] = await db.insert(departmentsTable).values(dept).returning();
    deptMap.set(dept.code, row.id);
  }
  logger.info(`Seeded ${DEPARTMENTS.length} departments`);

  // ─── 2. Seed roles & permissions ──────────────────────────────────
  const roleMap = new Map<string, number>();
  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    const displayNames: Record<string, string> = {
      admin: "System Administrator", manager: "Manager", employee: "Employee",
      hr: "HR Specialist", hr_admin: "HR Administrator", payroll_admin: "Payroll Administrator",
      recruiter: "Recruiter", finance: "Finance", it_admin: "IT Administrator",
    };
    const [row] = await db.insert(rolesTable).values({
      name: roleName,
      displayName: displayNames[roleName] || roleName,
      isSystem: "true",
    }).returning();
    roleMap.set(roleName, row.id);
  }

  const permMap = new Map<string, number>();
  for (const perm of PERMISSIONS) {
    const [row] = await db.insert(permissionsTable).values(perm).returning();
    permMap.set(perm.code, row.id);
  }

  for (const [roleName, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;
    for (const code of permCodes) {
      const permId = permMap.get(code);
      if (permId) {
        await db.insert(rolePermissionsTable).values({ roleId, permissionId: permId });
      }
    }
  }
  logger.info(`Seeded ${Object.keys(ROLE_PERMISSIONS).length} roles, ${PERMISSIONS.length} permissions`);

  // ─── 3. Seed employees ────────────────────────────────────────────
  const empMap = new Map<string, number>(); // email → id
  const allEmps: any[] = [];

  for (const emp of EMPLOYEES) {
    const [row] = await db.insert(usersTable).values({
      name: emp.name,
      email: emp.email,
      passwordHash: pw,
      role: emp.role === "admin" ? "admin" : emp.role === "manager" ? "manager" : "employee",
      department: emp.department,
      jobTitle: emp.jobTitle,
      location: emp.location,
      phone: emp.phone,
      hireDate: new Date(emp.hireDate),
      status: "active",
    }).returning();
    empMap.set(emp.email, row.id);
    allEmps.push({ ...row, roleType: emp.role });

    // Assign RBAC role
    const roleId = roleMap.get(emp.role);
    if (roleId) {
      await db.insert(userRolesTable).values({ userId: row.id, roleId, assignedBy: empMap.get("admin@dejoiy.com") });
    }
  }
  logger.info(`Seeded ${EMPLOYEES.length} employees`);

  const get = (email: string) => empMap.get(email)!;
  const allUserIds = Array.from(empMap.values());

  // ─── 4. Seed manager relationships (tasks, approvals reference managers) ──
  // Engineering team reports to Rahul
  const engTeam = ["sneha@dejoiy.com", "aditya@dejoiy.com", "nisha@dejoiy.com", "amit@dejoiy.com", "pooja@dejoiy.com", "karthik@dejoiy.com", "meera@dejoiy.com"];
  // Sales team reports to Aakash
  const salesTeam = ["divya@dejoiy.com", "mohit@dejoiy.com", "aisha@dejoiy.com"];

  // ─── 5. Seed tasks ────────────────────────────────────────────────
  const taskData = [
    { title: "Review Q2 engineering roadmap", creatorId: get("admin@dejoiy.com"), assigneeId: get("rahul@dejoiy.com"), priority: "high", status: "in_progress", dueDate: new Date("2026-06-15") },
    { title: "Complete compliance training", creatorId: get("priya@dejoiy.com"), assigneeId: get("sneha@dejoiy.com"), priority: "medium", status: "todo", dueDate: new Date("2026-06-30") },
    { title: "Submit expense report for client trip", creatorId: get("rajesh@dejoiy.com"), assigneeId: get("divya@dejoiy.com"), priority: "high", status: "todo", dueDate: new Date("2026-06-10") },
    { title: "Update security policies documentation", creatorId: get("gaurav@dejoiy.com"), assigneeId: get("neha@dejoiy.com"), priority: "medium", status: "in_progress", dueDate: new Date("2026-06-20") },
    { title: "Prepare quarterly business review", creatorId: get("admin@dejoiy.com"), assigneeId: get("sanjay@dejoiy.com"), priority: "urgent", status: "todo", dueDate: new Date("2026-06-05") },
    { title: "Onboard new marketing hire", creatorId: get("sunita@dejoiy.com"), assigneeId: get("priyanka@dejoiy.com"), priority: "low", status: "done", dueDate: new Date("2026-05-20") },
    { title: "Review performance goals for engineering", creatorId: get("rahul@dejoiy.com"), assigneeId: get("aditya@dejoiy.com"), priority: "medium", status: "todo", dueDate: new Date("2026-06-25") },
    { title: "Set up new employee workstation", creatorId: get("gaurav@dejoiy.com"), assigneeId: get("neha@dejoiy.com"), priority: "high", status: "in_progress", dueDate: new Date("2026-06-08") },
    { title: "Prepare annual benefits enrollment materials", creatorId: get("priya@dejoiy.com"), assigneeId: get("ananya@dejoiy.com"), priority: "medium", status: "todo", dueDate: new Date("2026-07-01") },
    { title: "Audit vendor contracts", creatorId: get("vikram.m@dejoiy.com"), assigneeId: get("sameer@dejoiy.com"), priority: "high", status: "todo", dueDate: new Date("2026-06-30") },
  ];
  await db.insert(tasksTable).values(taskData);
  logger.info("Seeded tasks");

  // ─── 6. Seed announcements ────────────────────────────────────────
  await db.insert(announcementsTable).values([
    { authorId: get("admin@dejoiy.com"), title: "Welcome to Q3 2026", content: "We're entering an exciting quarter with new product launches and team expansions. Let's make it count!", type: "general" },
    { authorId: get("priya@dejoiy.com"), title: "Updated Leave Policy", content: "Please review the updated leave policy in the employee handbook. Key changes include flexible holiday options and increased parental leave.", type: "hr" },
    { authorId: get("gaurav@dejoiy.com"), title: "Mandatory Security Training", content: "All employees must complete the annual security awareness training by June 30th. Check your email for the training link.", type: "it" },
    { authorId: get("rajesh@dejoiy.com"), title: "Expense Policy Update", content: "New expense categories have been added for remote work equipment. Check the updated policy for eligible items.", type: "finance" },
  ]);
  logger.info("Seeded announcements");

  // ─── 7. Seed leave requests ───────────────────────────────────────
  await db.insert(leaveRequestsTable).values([
    { employeeId: get("sneha@dejoiy.com"), type: "vacation", startDate: new Date("2026-07-14"), endDate: new Date("2026-07-18"), days: 5, status: "pending", reason: "Family vacation to Goa" },
    { employeeId: get("divya@dejoiy.com"), type: "personal", startDate: new Date("2026-06-12"), endDate: new Date("2026-06-12"), days: 1, status: "approved", reason: "Personal appointment", approverId: get("aakash@dejoiy.com") },
    { employeeId: get("nisha@dejoiy.com"), type: "sick", startDate: new Date("2026-06-03"), endDate: new Date("2026-06-04"), days: 2, status: "approved", reason: "Not feeling well", approverId: get("rahul@dejoiy.com") },
    { employeeId: get("pooja@dejoiy.com"), type: "vacation", startDate: new Date("2026-08-01"), endDate: new Date("2026-08-05"), days: 5, status: "pending", reason: "Summer holiday" },
    { employeeId: get("varun@dejoiy.com"), type: "personal", startDate: new Date("2026-06-20"), endDate: new Date("2026-06-20"), days: 1, status: "pending", reason: "Bank work" },
  ]);
  logger.info("Seeded leave requests");

  // ─── 8. Seed expenses ─────────────────────────────────────────────
  await db.insert(expensesTable).values([
    { employeeId: get("divya@dejoiy.com"), title: "Client dinner - Mumbai", amount: "4500.00", category: "meals", status: "pending", expenseDate: new Date("2026-06-01"), notes: "Dinner with Acme Corp team" },
    { employeeId: get("aditya@dejoiy.com"), title: "AWS cloud services", amount: "12000.00", category: "software", status: "approved", expenseDate: new Date("2026-05-15"), notes: "Monthly infrastructure costs", approverId: get("rahul@dejoiy.com") },
    { employeeId: get("sneha@dejoiy.com"), title: "Standing desk converter", amount: "8500.00", category: "equipment", status: "approved", expenseDate: new Date("2026-05-20"), notes: "Ergonomic equipment for home office", approverId: get("rahul@dejoiy.com") },
    { employeeId: get("mohit@dejoiy.com"), title: "Flight to Delhi - client meeting", amount: "6800.00", category: "travel", status: "pending", expenseDate: new Date("2026-06-03"), notes: "Round trip Mumbai-Delhi" },
    { employeeId: get("sanjay@dejoiy.com"), title: "Team lunch", amount: "3200.00", category: "meals", status: "pending", expenseDate: new Date("2026-06-02"), notes: "Product team offsite lunch" },
    { employeeId: get("ishita@dejoiy.com"), title: "Figma team license renewal", amount: "15000.00", category: "software", status: "approved", expenseDate: new Date("2026-05-01"), notes: "Annual design tool subscription", approverId: get("sanjay@dejoiy.com") },
  ]);
  logger.info("Seeded expenses");

  // ─── 9. Seed IT tickets ───────────────────────────────────────────
  await db.insert(itTicketsTable).values([
    { submitterId: get("nisha@dejoiy.com"), assigneeId: get("neha@dejoiy.com"), title: "VPN connection issues", description: "Cannot connect to VPN since Monday morning. Getting timeout errors.", category: "network", priority: "high", status: "in_progress" },
    { submitterId: get("pallavi@dejoiy.com"), assigneeId: get("gaurav@dejoiy.com"), title: "New employee laptop request", description: "Need to set up laptop for Meera Chopra joining March 1st.", category: "hardware", priority: "medium", status: "open" },
    { submitterId: get("divya@dejoiy.com"), title: "Salesforce access request", description: "Need access to Salesforce CRM for the new enterprise account.", category: "access", priority: "medium", status: "open" },
    { submitterId: get("meera@dejoiy.com"), assigneeId: get("neha@dejoiy.com"), title: "Software installation request", description: "Need Docker Desktop and VS Code installed on my workstation.", category: "software", priority: "low", status: "resolved", resolvedAt: new Date("2026-05-25") },
  ]);
  logger.info("Seeded IT tickets");

  // ─── 10. Seed goals ───────────────────────────────────────────────
  const goalTemplates = [
    { title: "Ship Q2 product features on schedule", category: "professional", progress: 65, status: "on_track" },
    { title: "Complete AWS Solutions Architect certification", category: "professional", progress: 40, status: "on_track" },
    { title: "Improve team velocity by 20%", category: "team", progress: 30, status: "at_risk" },
  ];
  for (const empId of allUserIds) {
    for (const g of goalTemplates) {
      await db.insert(goalsTable).values({
        employeeId: empId,
        ...g,
        dueDate: new Date("2026-12-31"),
      });
    }
  }
  logger.info("Seeded goals");

  // ─── 11. Seed performance reviews ─────────────────────────────────
  await db.insert(performanceReviewsTable).values([
    { employeeId: get("sneha@dejoiy.com"), reviewerId: get("rahul@dejoiy.com"), period: "Q1 2026", overallRating: 4, strengths: "Excellent frontend skills, strong code reviews", improvements: "Could take more ownership of architecture decisions", comments: "Strong performer, ready for senior role consideration", status: "submitted" },
    { employeeId: get("aditya@dejoiy.com"), reviewerId: get("rahul@dejoiy.com"), period: "Q1 2026", overallRating: 5, strengths: "Outstanding backend architecture, mentoring junior devs", improvements: "Documentation could be more thorough", comments: "Top performer, recommend for promotion", status: "acknowledged" },
    { employeeId: get("divya@dejoiy.com"), reviewerId: get("aakash@dejoiy.com"), period: "Q1 2026", overallRating: 4, strengths: "Strong client relationships, exceeded quota by 15%", improvements: "Pipeline documentation needs improvement", comments: "Consistent top performer on the sales team", status: "submitted" },
    { employeeId: get("rahul@dejoiy.com"), reviewerId: get("admin@dejoiy.com"), period: "Annual 2025", overallRating: 5, strengths: "Exceptional leadership, built strong engineering culture", improvements: "Could improve cross-team communication", comments: "Instrumental in successful product launch", status: "acknowledged" },
  ]);
  logger.info("Seeded performance reviews");

  // ─── 12. Seed payroll (6 months) ──────────────────────────────────
  const salaryRanges: Record<string, number> = {
    Executive: 250000, HR: 80000, Engineering: 120000, Product: 110000,
    Design: 90000, Finance: 95000, Sales: 85000, Marketing: 80000,
    Operations: 65000, IT: 90000, Legal: 100000,
  };
  const periods = ["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026"];
  for (const emp of allEmps) {
    const base = salaryRanges[emp.department] || 80000;
    for (const period of periods) {
      const bonus = Math.random() > 0.7 ? Math.round(base * 0.05) : 0;
      const deductions = Math.round(base * 0.22);
      await db.insert(payrollTable).values({
        employeeId: emp.id,
        period,
        baseSalary: base.toString(),
        bonus: bonus.toString(),
        deductions: deductions.toString(),
        netPay: (base - deductions + bonus).toString(),
        status: "paid",
        paidAt: new Date(),
      });
    }
  }
  logger.info("Seeded payroll for 6 months");

  // ─── 13. Seed job postings ────────────────────────────────────────
  const [feJob] = await db.insert(jobPostingsTable).values({
    title: "Senior Frontend Engineer", department: "Engineering", location: "Bangalore / Remote",
    type: "full_time", description: "Build and maintain our React-based enterprise platform. Work closely with product and design.", requirements: "5+ years React, TypeScript, Tailwind CSS. Enterprise SaaS experience preferred.", salaryMin: 120000, salaryMax: 180000, status: "open", postedById: get("rahul@dejoiy.com"),
  }).returning();
  const [pmJob] = await db.insert(jobPostingsTable).values({
    title: "Product Manager - Growth", department: "Product", location: "Mumbai",
    type: "full_time", description: "Drive growth initiatives for our enterprise workforce platform.", requirements: "3+ years PM experience in B2B SaaS. Data-driven mindset.", salaryMin: 100000, salaryMax: 150000, status: "open", postedById: get("sanjay@dejoiy.com"),
  }).returning();
  const [salesJob] = await db.insert(jobPostingsTable).values({
    title: "Enterprise Account Executive", department: "Sales", location: "Delhi / Mumbai",
    type: "full_time", description: "Close enterprise deals for our workforce management platform.", requirements: "3+ years enterprise B2B sales. HR tech experience a plus.", salaryMin: 90000, salaryMax: 140000, status: "open", postedById: get("aakash@dejoiy.com"),
  }).returning();
  const [designJob] = await db.insert(jobPostingsTable).values({
    title: "Senior UX Designer", department: "Design", location: "Mumbai / Remote",
    type: "full_time", description: "Design intuitive enterprise workflows for HR and workforce management.", requirements: "4+ years UX design. Enterprise/product design experience required.", salaryMin: 90000, salaryMax: 130000, status: "open", postedById: get("ishita@dejoiy.com"),
  }).returning();

  // ─── 14. Seed applications ────────────────────────────────────────
  const applicants = [
    { name: "Rohan Malhotra", email: "rohan.m@example.com" },
    { name: "Sakshi Agarwal", email: "sakshi@example.com" },
    { name: "Vivek Pandey", email: "vivek.p@example.com" },
  ];
  const jobs = [feJob, pmJob, salesJob, designJob];
  const statuses = ["new", "screening", "interview"];
  for (const job of jobs) {
    for (let i = 0; i < applicants.length; i++) {
      await db.insert(applicationsTable).values({
        jobPostingId: job.id,
        applicantName: applicants[i].name,
        applicantEmail: applicants[i].email,
        status: statuses[i],
        notes: i === 0 ? "Strong resume, matches requirements" : i === 1 ? "Good communication in phone screen" : "Met minimum requirements",
      });
    }
  }
  logger.info("Seeded job postings and applications");

  // ─── 15. Seed timesheets ──────────────────────────────────────────
  for (const empId of allUserIds.slice(0, 15)) {
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await db.insert(timesheetsTable).values({
        employeeId: empId,
        date,
        hoursWorked: (7 + Math.random() * 2).toFixed(2),
        project: ["Dejoiy Platform", "Client Project", "Internal Tools", "R&D"][Math.floor(Math.random() * 4)],
        description: "Regular work activities",
        status: i === 0 ? "draft" : "approved",
      });
    }
  }
  logger.info("Seeded timesheets");

  // ─── 16. Seed events ──────────────────────────────────────────────
  await db.insert(eventsTable).values([
    { title: "All Hands - Q3 Kickoff", description: "Company-wide quarterly kickoff meeting", type: "meeting", startDate: new Date("2026-07-01T10:00:00"), endDate: new Date("2026-07-01T11:30:00"), location: "Zoom", organizerId: get("admin@dejoiy.com"), allDay: false },
    { title: "Engineering Sprint Planning", description: "Bi-weekly sprint planning for engineering", type: "meeting", startDate: new Date("2026-06-09T10:00:00"), endDate: new Date("2026-06-09T11:00:00"), location: "Conference Room A", organizerId: get("rahul@dejoiy.com"), allDay: false },
    { title: "Independence Day", description: "National holiday - office closed", type: "holiday", startDate: new Date("2026-08-15T00:00:00"), endDate: new Date("2026-08-15T23:59:59"), location: "All offices", organizerId: get("admin@dejoiy.com"), allDay: true },
    { title: "UX Workshop", description: "Design thinking workshop for product team", type: "training", startDate: new Date("2026-06-16T14:00:00"), endDate: new Date("2026-06-16T17:00:00"), location: "Design Studio", organizerId: get("ishita@dejoiy.com"), allDay: false },
    { title: "Annual Summer Outing", description: "Team bonding event at Gateway of India", type: "social", startDate: new Date("2026-06-20T10:00:00"), endDate: new Date("2026-06-20T18:00:00"), location: "Gateway of India, Mumbai", organizerId: get("suresh@dejoiy.com"), allDay: false },
    { title: "Security Awareness Training", description: "Mandatory annual security training session", type: "training", startDate: new Date("2026-06-25T09:00:00"), endDate: new Date("2026-06-25T10:00:00"), location: "Online (Zoom)", organizerId: get("gaurav@dejoiy.com"), allDay: false },
  ]);
  logger.info("Seeded events");

  // ─── 17. Seed assets ──────────────────────────────────────────────
  await db.insert(assetsTable).values([
    { name: "MacBook Pro 14\" M3", type: "laptop", serialNumber: "MBP-2026-001", assignedToId: get("admin@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-01-15"), purchaseValue: "249999" },
    { name: "MacBook Pro 16\" M3", type: "laptop", serialNumber: "MBP-2026-002", assignedToId: get("sneha@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-02-01"), purchaseValue: "299999" },
    { name: "Dell XPS 15", type: "laptop", serialNumber: "DELL-2026-003", assignedToId: get("aditya@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-02-15"), purchaseValue: "149999" },
    { name: "ThinkPad X1 Carbon", type: "laptop", serialNumber: "LEN-2026-004", assignedToId: get("rajesh@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-03-01"), purchaseValue: "139999" },
    { name: "Dell UltraSharp 27\" Monitor", type: "monitor", serialNumber: "DELL-MON-001", assignedToId: get("sneha@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-02-01"), purchaseValue: "34999" },
    { name: "Logitech MX Master 3S", type: "mouse", serialNumber: "LOGI-001", assignedToId: get("sneha@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-02-01"), purchaseValue: "8999" },
    { name: "Keychron K2 Pro", type: "keyboard", serialNumber: "KEYC-001", assignedToId: get("nisha@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-03-01"), purchaseValue: "7999" },
    { name: "iPhone 15 Pro", type: "phone", serialNumber: "IPH-2026-001", assignedToId: get("admin@dejoiy.com"), status: "assigned", purchaseDate: new Date("2026-01-15"), purchaseValue: "159999" },
    { name: "iPad Air M2", type: "tablet", serialNumber: "IPAD-001", status: "available", purchaseDate: new Date("2026-04-01"), purchaseValue: "59999" },
    { name: "Dell PowerEdge R750", type: "server", serialNumber: "SRV-001", assignedToId: get("amit@dejoiy.com"), status: "assigned", purchaseDate: new Date("2025-12-01"), purchaseValue: "499999" },
    { name: "MacBook Air M2 (Spare)", type: "laptop", serialNumber: "MBA-001", status: "available", purchaseDate: new Date("2026-05-01"), purchaseValue: "99999" },
    { name: "Dell P2422H Monitor", type: "monitor", serialNumber: "DELL-MON-002", status: "available", purchaseDate: new Date("2026-05-15"), purchaseValue: "18999" },
  ]);
  logger.info("Seeded assets");

  // ─── 18. Seed approval requests with workflow steps ────────────────
  // Leave approval: Sneha → Rahul (manager)
  const [leaveApproval] = await db.insert(approvalRequestsTable).values({
    entityType: "leave_request",
    entityId: 1, // first leave request
    requesterId: get("sneha@dejoiy.com"),
    status: "pending",
    currentStep: 1,
    totalSteps: 1,
    title: "Vacation Request — 5 days",
    summary: "Sneha Singh requests vacation from Jul 14-18, 2026",
    priority: "normal",
    submittedAt: new Date("2026-06-01"),
  }).returning();

  await db.insert(approvalStepsTable).values({
    requestId: leaveApproval.id,
    stepNumber: 1,
    stepName: "Manager Approval",
    approverId: get("rahul@dejoiy.com"),
    status: "pending",
  });

  // Expense approval: Divya → Aakash (manager)
  const [expenseApproval] = await db.insert(approvalRequestsTable).values({
    entityType: "expense",
    entityId: 1,
    requesterId: get("divya@dejoiy.com"),
    status: "pending",
    currentStep: 1,
    totalSteps: 1,
    title: "Expense Report — Client Dinner",
    summary: "₹4,500 for client dinner with Acme Corp",
    amount: "4500",
    priority: "normal",
    submittedAt: new Date("2026-06-01"),
  }).returning();

  await db.insert(approvalStepsTable).values({
    requestId: expenseApproval.id,
    stepNumber: 1,
    stepName: "Manager Approval",
    approverId: get("aakash@dejoiy.com"),
    status: "pending",
  });

  // Timesheet approval: Mohit → Aakash
  const [tsApproval] = await db.insert(approvalRequestsTable).values({
    entityType: "timesheet",
    entityId: 1,
    requesterId: get("mohit@dejoiy.com"),
    status: "pending",
    currentStep: 1,
    totalSteps: 1,
    title: "Weekly Timesheet — Week of Jun 2",
    summary: "40 hours logged across Client Project",
    priority: "normal",
    submittedAt: new Date("2026-06-06"),
  }).returning();

  await db.insert(approvalStepsTable).values({
    requestId: tsApproval.id,
    stepNumber: 1,
    stepName: "Manager Approval",
    approverId: get("aakash@dejoiy.com"),
    status: "pending",
  });

  // IT Access request: Divya → Gaurav (IT admin)
  const [itApproval] = await db.insert(approvalRequestsTable).values({
    entityType: "access_request",
    entityId: 3,
    requesterId: get("divya@dejoiy.com"),
    status: "pending",
    currentStep: 1,
    totalSteps: 2,
    title: "Salesforce Access Request",
    summary: "Divya Kapoor requests Salesforce CRM access for enterprise account management",
    priority: "normal",
    submittedAt: new Date("2026-06-03"),
  }).returning();

  await db.insert(approvalStepsTable).values([
    { requestId: itApproval.id, stepNumber: 1, stepName: "IT Manager Approval", approverId: get("gaurav@dejoiy.com"), status: "pending" },
    { requestId: itApproval.id, stepNumber: 2, stepName: "Security Review", approverId: get("gaurav@dejoiy.com"), status: "pending" },
  ]);

  // Approved expense: Aditya → Rahul (already approved)
  const [approvedExpense] = await db.insert(approvalRequestsTable).values({
    entityType: "expense",
    entityId: 2,
    requesterId: get("aditya@dejoiy.com"),
    status: "approved",
    currentStep: 1,
    totalSteps: 1,
    title: "Expense Report — AWS Services",
    summary: "₹12,000 for monthly AWS infrastructure costs",
    amount: "12000",
    priority: "normal",
    submittedAt: new Date("2026-05-16"),
    resolvedAt: new Date("2026-05-17"),
  }).returning();

  await db.insert(approvalStepsTable).values({
    requestId: approvedExpense.id,
    stepNumber: 1,
    stepName: "Manager Approval",
    approverId: get("rahul@dejoiy.com"),
    status: "approved",
    action: "approve",
    comment: "Approved — infrastructure costs are within budget",
    decidedAt: new Date("2026-05-17"),
  });

  logger.info("Seeded approval workflows");

  // ─── 19. Seed audit logs ──────────────────────────────────────────
  await db.insert(auditLogsTable).values([
    { actorId: get("admin@dejoiy.com"), actorName: "Arjun Sharma", actorRole: "admin", action: "login", entityType: "session", metadata: { method: "password" } },
    { actorId: get("priya@dejoiy.com"), actorName: "Priya Patel", actorRole: "hr", action: "create", entityType: "announcement", entityId: 2, entityName: "Updated Leave Policy" },
    { actorId: get("rahul@dejoiy.com"), actorName: "Rahul Gupta", actorRole: "manager", action: "approve", entityType: "expense", entityId: 2, entityName: "AWS cloud services", newValue: { status: "approved" } },
    { actorId: get("rahul@dejoiy.com"), actorName: "Rahul Gupta", actorRole: "manager", action: "approve", entityType: "expense", entityId: 3, entityName: "Standing desk converter", newValue: { status: "approved" } },
    { actorId: get("aakash@dejoiy.com"), actorName: "Aakash Bhatia", actorRole: "manager", action: "approve", entityType: "leave_request", entityId: 2, entityName: "Divya Kapoor — Personal leave", newValue: { status: "approved" } },
    { actorId: get("admin@dejoiy.com"), actorName: "Arjun Sharma", actorRole: "admin", action: "create", entityType: "user", entityId: get("meera@dejoiy.com"), entityName: "Meera Chopra" },
    { actorId: get("gaurav@dejoiy.com"), actorName: "Gaurav Saxena", actorRole: "it_admin", action: "resolve", entityType: "it_ticket", entityId: 4, entityName: "Software installation request", newValue: { status: "resolved" } },
  ]);
  logger.info("Seeded audit logs");

  // ─── 20. Seed notifications ───────────────────────────────────────
  await db.insert(notificationsTable).values([
    { userId: get("rahul@dejoiy.com"), title: "Leave Request Pending", message: "Sneha Singh has requested 5 days vacation (Jul 14-18). Review and approve.", type: "info" },
    { userId: get("rahul@dejoiy.com"), title: "Expense Approved", message: "You approved Aditya Kumar's expense of ₹12,000 for AWS services.", type: "success" },
    { userId: get("aakash@dejoiy.com"), title: "Expense Pending", message: "Divya Kapoor submitted a ₹4,500 expense report for client dinner.", type: "info" },
    { userId: get("aakash@dejoiy.com"), title: "Timesheet Pending", message: "Mohit Sinha submitted weekly timesheet for approval.", type: "info" },
    { userId: get("divya@dejoiy.com"), title: "Expense Submitted", message: "Your expense report for ₹4,500 has been submitted for approval.", type: "success" },
    { userId: get("sneha@dejoiy.com"), title: "Leave Request Submitted", message: "Your vacation request for Jul 14-18 has been submitted for manager approval.", type: "success" },
    { userId: get("gaurav@dejoiy.com"), title: "IT Access Request", message: "Divya Kapoor is requesting Salesforce CRM access. Please review.", type: "info" },
    { userId: get("neha@dejoiy.com"), title: "Ticket Assigned", message: "You've been assigned VPN connection issues ticket from Nisha Joshi.", type: "info" },
    { userId: get("admin@dejoiy.com"), title: "New Employee Onboarding", message: "Meera Chopra joined the Engineering team. Welcome her!", type: "info" },
    { userId: get("sanjay@dejoiy.com"), title: "New Applications", message: "3 new applications received for Senior Frontend Engineer position.", type: "info" },
  ]);
  logger.info("Seeded notifications");

  logger.info("Enterprise seed complete ✓");
}
