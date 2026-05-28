import { db, usersTable, tasksTable, notificationsTable, leaveRequestsTable, expensesTable, itTicketsTable, announcementsTable, goalsTable, performanceReviewsTable, payrollTable, jobPostingsTable, applicationsTable, timesheetsTable, eventsTable, assetsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { logger } from "./logger";

export async function seed() {
  const users = await db.select().from(usersTable).limit(1);
  if (users.length > 0) {
    // Users exist — seed only the new modules if they're empty
    await seedNewModules();
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

  const allUsers = [admin, manager, rahul, sneha, vikram];

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
    { employeeId: rahul.id, title: "Client Dinner", amount: "150.00", category: "travel", status: "approved", expenseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), notes: "Dinner with potential client" },
  ]);

  // IT Tickets
  await db.insert(itTicketsTable).values([
    { submitterId: rahul.id, title: "VPN Access", description: "Cannot connect to the company VPN", category: "access", priority: "high", status: "open" },
  ]);

  // Goals
  for (const user of allUsers) {
    await db.insert(goalsTable).values([
      { employeeId: user.id, title: "Complete Q2 objectives", category: "professional", progress: 45, status: "on_track", dueDate: new Date("2026-06-30") },
      { employeeId: user.id, title: "Learn React Context", category: "personal", progress: 80, status: "on_track", dueDate: new Date("2026-04-15") },
      { employeeId: user.id, title: "Improve team collaboration", category: "team", progress: 20, status: "at_risk", dueDate: new Date("2026-12-31") },
    ]);
  }

  // Performance Reviews
  await db.insert(performanceReviewsTable).values([
    { employeeId: rahul.id, reviewerId: manager.id, period: "Q1 2026", overallRating: 4, strengths: "Great analytical skills", improvements: "Communication during meetings", comments: "Overall very positive", status: "submitted" },
    { employeeId: manager.id, reviewerId: admin.id, period: "Annual 2025", overallRating: 5, strengths: "Exceptional leadership", improvements: "N/A", comments: "Promising future", status: "acknowledged" },
  ]);

  // Payroll
  const periods = ["May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026"];
  for (const user of allUsers) {
    for (const period of periods) {
      const base = 5000 + (user.id * 500);
      await db.insert(payrollTable).values({
        employeeId: user.id,
        period,
        baseSalary: base.toString(),
        bonus: (base * 0.1).toString(),
        deductions: (base * 0.05).toString(),
        netPay: (base * 1.05).toString(),
        status: "paid",
        paidAt: new Date(),
      });
    }
  }

  // Job Postings
  const [feJob] = await db.insert(jobPostingsTable).values({
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "full_time",
    description: "Build beautiful UIs with React and Tailwind.",
    requirements: "3+ years React experience",
    salaryMin: 80000,
    salaryMax: 120000,
    status: "open",
    postedById: admin.id,
  }).returning();

  const [pmJob] = await db.insert(jobPostingsTable).values({
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "full_time",
    description: "Define product roadmap and strategy.",
    requirements: "Experience in SaaS products",
    salaryMin: 90000,
    salaryMax: 140000,
    status: "open",
    postedById: admin.id,
  }).returning();

  const [hrJob] = await db.insert(jobPostingsTable).values({
    title: "HR Business Partner",
    department: "HR",
    location: "New York",
    type: "full_time",
    description: "Support HR operations and employee relations.",
    requirements: "5+ years HR experience",
    salaryMin: 70000,
    salaryMax: 100000,
    status: "open",
    postedById: manager.id,
  }).returning();

  const [daJob] = await db.insert(jobPostingsTable).values({
    title: "Data Analyst",
    department: "Data",
    location: "Remote",
    type: "contract",
    description: "Analyze business data and generate insights.",
    requirements: "Proficiency in SQL and Python",
    salaryMin: 60000,
    salaryMax: 90000,
    status: "open",
    postedById: admin.id,
  }).returning();

  const jobs = [feJob, pmJob, hrJob, daJob];

  // Applications
  for (const job of jobs) {
    await db.insert(applicationsTable).values([
      { jobPostingId: job.id, applicantName: "John Doe", applicantEmail: "john@example.com", status: "new", notes: "Strong resume" },
      { jobPostingId: job.id, applicantName: "Jane Smith", applicantEmail: "jane@example.com", status: "interview", notes: "Good communication skills" },
      { jobPostingId: job.id, applicantName: "Alice Wong", applicantEmail: "alice@example.com", status: "screening", notes: "Met minimum requirements" },
    ]);
  }

  // Timesheets (last 7 days for admin)
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await db.insert(timesheetsTable).values({
      employeeId: admin.id,
      date,
      hoursWorked: "8.0",
      project: "Dejoiy Platform",
      description: "Developing new modules",
      status: "approved",
    });
  }

  // Events
  await db.insert(eventsTable).values([
    { title: "Team Weekly Sync", description: "Sync on project progress", type: "meeting", startDate: new Date("2026-05-18T10:00:00"), endDate: new Date("2026-05-18T11:00:00"), location: "Zoom", organizerId: admin.id },
    { title: "Quarterly Townhall", description: "Company wide updates", type: "other", startDate: new Date("2026-05-20T14:00:00"), endDate: new Date("2026-05-20T15:30:00"), location: "Auditorium", organizerId: admin.id },
    { title: "Summer Picnic", description: "Annual summer celebration", type: "social", startDate: new Date("2026-06-15T12:00:00"), endDate: new Date("2026-06-15T18:00:00"), location: "Central Park", organizerId: manager.id },
    { title: "IT Security Training", description: "Mandatory security training", type: "training", startDate: new Date("2026-05-22T09:00:00"), endDate: new Date("2026-05-22T10:30:00"), location: "Online", organizerId: sneha.id },
    { title: "National Holiday", description: "Office closed", type: "holiday", startDate: new Date("2026-07-04T00:00:00"), endDate: new Date("2026-07-04T23:59:59"), allDay: true, organizerId: admin.id },
  ]);

  // Assets
  await db.insert(assetsTable).values([
    { name: "MacBook Pro 14\"", type: "laptop", serialNumber: "MBP123456", assignedToId: admin.id, status: "assigned", purchaseDate: new Date("2025-01-10"), purchaseValue: "2499.99" },
    { name: "Dell XPS 15", type: "laptop", serialNumber: "DELL987654", assignedToId: rahul.id, status: "assigned", purchaseDate: new Date("2025-02-15"), purchaseValue: "1899.00" },
    { name: "LG UltraFine 4K", type: "monitor", serialNumber: "LG554433", assignedToId: admin.id, status: "assigned", purchaseDate: new Date("2025-01-10"), purchaseValue: "699.99" },
    { name: "iPhone 15 Pro", type: "phone", serialNumber: "IPH776655", assignedToId: manager.id, status: "assigned", purchaseDate: new Date("2025-03-01"), purchaseValue: "1099.00" },
    { name: "Logitech MX Master 3S", type: "mouse", serialNumber: "LOGI112233", status: "available", purchaseDate: new Date("2025-04-10"), purchaseValue: "99.99" },
    { name: "Keychron K2", type: "keyboard", serialNumber: "KEYC334455", status: "available", purchaseDate: new Date("2025-04-10"), purchaseValue: "89.00" },
    { name: "iPad Air", type: "tablet", serialNumber: "IPAD556677", status: "maintenance", purchaseDate: new Date("2024-11-20"), purchaseValue: "599.00" },
    { name: "Dell Server R740", type: "server", serialNumber: "SRV112233", status: "assigned", purchaseDate: new Date("2024-05-15"), purchaseValue: "5499.00" },
  ]);

  logger.info("Seeding complete.");
}

async function seedNewModules() {
  const allUsers = await db.select().from(usersTable);
  if (allUsers.length === 0) return;

  const admin = allUsers.find(u => u.role === "admin") || allUsers[0];
  const manager = allUsers.find(u => u.role === "manager") || allUsers[0];

  // Goals
  const existingGoals = await db.select().from(goalsTable).limit(1);
  if (existingGoals.length === 0) {
    logger.info("Seeding goals...");
    for (const user of allUsers) {
      await db.insert(goalsTable).values([
        { employeeId: user.id, title: "Complete Q2 objectives", category: "professional", progress: 45, status: "on_track", dueDate: new Date("2026-06-30") },
        { employeeId: user.id, title: "Improve technical skills", category: "personal", progress: 80, status: "on_track", dueDate: new Date("2026-04-15") },
        { employeeId: user.id, title: "Improve team collaboration", category: "team", progress: 20, status: "at_risk", dueDate: new Date("2026-12-31") },
      ]);
    }
  }

  // Performance Reviews
  const existingReviews = await db.select().from(performanceReviewsTable).limit(1);
  if (existingReviews.length === 0) {
    logger.info("Seeding performance reviews...");
    const employees = allUsers.filter(u => u.role === "employee");
    if (employees.length > 0) {
      await db.insert(performanceReviewsTable).values([
        { employeeId: employees[0].id, reviewerId: manager.id, period: "Q1 2026", overallRating: 4, strengths: "Great analytical skills", improvements: "Communication during meetings", comments: "Overall very positive", status: "submitted" },
        { employeeId: manager.id, reviewerId: admin.id, period: "Annual 2025", overallRating: 5, strengths: "Exceptional leadership", improvements: "N/A", comments: "Promising future", status: "acknowledged" },
      ]);
    }
  }

  // Payroll
  const existingPayroll = await db.select().from(payrollTable).limit(1);
  if (existingPayroll.length === 0) {
    logger.info("Seeding payroll...");
    const periods = ["May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026"];
    for (const user of allUsers) {
      for (const period of periods) {
        const base = 5000 + (user.id * 500);
        await db.insert(payrollTable).values({
          employeeId: user.id,
          period,
          baseSalary: base.toString(),
          bonus: (base * 0.1).toString(),
          deductions: (base * 0.05).toString(),
          netPay: (base * 1.05).toString(),
          status: "paid",
          paidAt: new Date(),
        });
      }
    }
  }

  // Job Postings
  const existingJobs = await db.select().from(jobPostingsTable).limit(1);
  if (existingJobs.length === 0) {
    logger.info("Seeding job postings...");
    const [feJob] = await db.insert(jobPostingsTable).values({ title: "Frontend Engineer", department: "Engineering", location: "Remote", type: "full_time", description: "Build beautiful UIs with React and Tailwind.", requirements: "3+ years React experience", salaryMin: 80000, salaryMax: 120000, status: "open", postedById: admin.id }).returning();
    const [pmJob] = await db.insert(jobPostingsTable).values({ title: "Product Manager", department: "Product", location: "Remote", type: "full_time", description: "Define product roadmap and strategy.", requirements: "Experience in SaaS products", salaryMin: 90000, salaryMax: 140000, status: "open", postedById: admin.id }).returning();
    const [hrJob] = await db.insert(jobPostingsTable).values({ title: "HR Business Partner", department: "HR", location: "New York", type: "full_time", description: "Support HR operations and employee relations.", requirements: "5+ years HR experience", salaryMin: 70000, salaryMax: 100000, status: "open", postedById: manager.id }).returning();
    const [daJob] = await db.insert(jobPostingsTable).values({ title: "Data Analyst", department: "Data", location: "Remote", type: "contract", description: "Analyze business data and generate insights.", requirements: "Proficiency in SQL and Python", salaryMin: 60000, salaryMax: 90000, status: "open", postedById: admin.id }).returning();

    for (const job of [feJob, pmJob, hrJob, daJob]) {
      await db.insert(applicationsTable).values([
        { jobPostingId: job.id, applicantName: "John Doe", applicantEmail: "john@example.com", status: "new", notes: "Strong resume" },
        { jobPostingId: job.id, applicantName: "Jane Smith", applicantEmail: "jane@example.com", status: "interview", notes: "Good communication skills" },
        { jobPostingId: job.id, applicantName: "Alice Wong", applicantEmail: "alice@example.com", status: "screening", notes: "Met minimum requirements" },
      ]);
    }
  }

  // Timesheets
  const existingTimesheets = await db.select().from(timesheetsTable).limit(1);
  if (existingTimesheets.length === 0) {
    logger.info("Seeding timesheets...");
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await db.insert(timesheetsTable).values({ employeeId: admin.id, date, hoursWorked: "8.0", project: "Dejoiy Platform", description: "Developing new modules", status: "approved" });
    }
  }

  // Events
  const existingEvents = await db.select().from(eventsTable).limit(1);
  if (existingEvents.length === 0) {
    logger.info("Seeding events...");
    await db.insert(eventsTable).values([
      { title: "Team Weekly Sync", description: "Sync on project progress", type: "meeting", startDate: new Date("2026-06-02T10:00:00"), endDate: new Date("2026-06-02T11:00:00"), location: "Zoom", organizerId: admin.id },
      { title: "Quarterly Townhall", description: "Company wide updates", type: "other", startDate: new Date("2026-06-10T14:00:00"), endDate: new Date("2026-06-10T15:30:00"), location: "Auditorium", organizerId: admin.id },
      { title: "Summer Picnic", description: "Annual summer celebration", type: "social", startDate: new Date("2026-06-15T12:00:00"), endDate: new Date("2026-06-15T18:00:00"), location: "Central Park", organizerId: manager.id },
      { title: "IT Security Training", description: "Mandatory security training", type: "training", startDate: new Date("2026-06-22T09:00:00"), endDate: new Date("2026-06-22T10:30:00"), location: "Online", organizerId: admin.id },
      { title: "National Holiday", description: "Office closed", type: "holiday", startDate: new Date("2026-07-04T00:00:00"), endDate: new Date("2026-07-04T23:59:59"), allDay: true, organizerId: admin.id },
    ]);
  }

  // Assets
  const existingAssets = await db.select().from(assetsTable).limit(1);
  if (existingAssets.length === 0) {
    logger.info("Seeding assets...");
    await db.insert(assetsTable).values([
      { name: "MacBook Pro 14\"", type: "laptop", serialNumber: "MBP123456", assignedToId: admin.id, status: "assigned", purchaseDate: new Date("2025-01-10"), purchaseValue: "2499.99" },
      { name: "Dell XPS 15", type: "laptop", serialNumber: "DELL987654", assignedToId: allUsers[2]?.id ?? admin.id, status: "assigned", purchaseDate: new Date("2025-02-15"), purchaseValue: "1899.00" },
      { name: "LG UltraFine 4K", type: "monitor", serialNumber: "LG554433", assignedToId: admin.id, status: "assigned", purchaseDate: new Date("2025-01-10"), purchaseValue: "699.99" },
      { name: "iPhone 15 Pro", type: "phone", serialNumber: "IPH776655", assignedToId: manager.id, status: "assigned", purchaseDate: new Date("2025-03-01"), purchaseValue: "1099.00" },
      { name: "Logitech MX Master 3S", type: "mouse", serialNumber: "LOGI112233", status: "available", purchaseDate: new Date("2025-04-10"), purchaseValue: "99.99" },
      { name: "Keychron K2", type: "keyboard", serialNumber: "KEYC334455", status: "available", purchaseDate: new Date("2025-04-10"), purchaseValue: "89.00" },
      { name: "iPad Air", type: "tablet", serialNumber: "IPAD556677", status: "maintenance", purchaseDate: new Date("2024-11-20"), purchaseValue: "599.00" },
      { name: "Dell Server R740", type: "server", serialNumber: "SRV112233", status: "assigned", purchaseDate: new Date("2024-05-15"), purchaseValue: "5499.00" },
    ]);
  }
}
