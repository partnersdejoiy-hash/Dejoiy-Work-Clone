import { db, usersTable, tasksTable, notificationsTable, leaveRequestsTable, expensesTable, itTicketsTable, announcementsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { logger } from "./logger";

export async function seed() {
  const users = await db.select().from(usersTable).limit(1);
  if (users.length > 0) {
    return;
  }

  logger.info("Seeding database...");

  const passwordHash = await bcrypt.hash("demo123", 10);

  const [admin] = await db.insert(usersTable).values({
    name: "Arjun Sharma",
    email: "admin@dejoiy.com",
    passwordHash,
    role: "admin",
    department: "Engineering",
    jobTitle: "CTO",
    status: "active",
  }).returning();

  const [manager] = await db.insert(usersTable).values({
    name: "Priya Patel",
    email: "priya@dejoiy.com",
    passwordHash,
    role: "manager",
    department: "HR",
    jobTitle: "HR Manager",
    status: "active",
  }).returning();

  const [rahul] = await db.insert(usersTable).values({
    name: "Rahul Gupta",
    email: "rahul@dejoiy.com",
    passwordHash,
    role: "employee",
    department: "Finance",
    jobTitle: "Finance Analyst",
    status: "active",
  }).returning();

  const [sneha] = await db.insert(usersTable).values({
    name: "Sneha Singh",
    email: "sneha@dejoiy.com",
    passwordHash,
    role: "employee",
    department: "IT",
    jobTitle: "IT Engineer",
    status: "active",
  }).returning();

  const [vikram] = await db.insert(usersTable).values({
    name: "Vikram Nair",
    email: "vikram@dejoiy.com",
    passwordHash,
    role: "employee",
    department: "Operations",
    jobTitle: "Operations Lead",
    status: "active",
  }).returning();

  // Tasks
  await db.insert(tasksTable).values([
    { title: "Review quarterly reports", creatorId: admin.id, assigneeId: rahul.id, priority: "high", status: "todo" },
    { title: "Upgrade office network", creatorId: admin.id, assigneeId: sneha.id, priority: "urgent", status: "in_progress" },
    { title: "Plan team offsite", creatorId: manager.id, assigneeId: vikram.id, priority: "medium", status: "todo" },
  ]);

  // Announcements
  await db.insert(announcementsTable).values([
    { authorId: admin.id, title: "Welcome to Dejoiy", content: "We are excited to have you all on board!", type: "general" },
    { authorId: manager.id, title: "New Leave Policy", content: "Please review the updated leave policy in the employee handbook.", type: "hr" },
  ]);

  // Notifications
  await db.insert(notificationsTable).values([
    { userId: rahul.id, title: "New Task", message: "You have a new task: Review quarterly reports", type: "info" },
    { userId: sneha.id, title: "Urgent Task", message: "Please attend to the office network upgrade", type: "warning" },
  ]);

  // Leave Requests
  await db.insert(leaveRequestsTable).values([
    { employeeId: rahul.id, type: "vacation", startDate: new Date("2024-12-20"), endDate: new Date("2024-12-25"), days: 5, status: "pending", reason: "Annual holiday" },
  ]);

  // Expenses
  await db.insert(expensesTable).values([
    { employeeId: sneha.id, title: "New Monitor", amount: "299.99", category: "equipment", status: "pending", expenseDate: new Date(), notes: "For office setup" },
  ]);

  // IT Tickets
  await db.insert(itTicketsTable).values([
    { submitterId: rahul.id, title: "VPN Access", description: "Cannot connect to the company VPN", category: "access", priority: "high", status: "open" },
  ]);

  logger.info("Seeding complete.");
}
