import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  ListUsersResponse,
  CreateUserBody,
  GetUserParams,
  GetUserResponse,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(
    ListUsersResponse.parse(
      users.map((u) => ({
        ...u,
        createdAt: u.createdAt?.toISOString(),
        hireDate: u.hireDate?.toISOString(),
        updatedAt: u.updatedAt?.toISOString(),
      })),
    ),
  );
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({
      ...parsed.data,
      passwordHash,
      status: "active",
    })
    .returning();

  res.status(201).json(
    GetUserResponse.parse({
      ...user,
      createdAt: user.createdAt?.toISOString(),
      hireDate: user.hireDate?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    }),
  );
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(
    GetUserResponse.parse({
      ...user,
      createdAt: user.createdAt?.toISOString(),
      hireDate: user.hireDate?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    }),
  );
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(
    UpdateUserResponse.parse({
      ...user,
      createdAt: user.createdAt?.toISOString(),
      hireDate: user.hireDate?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    }),
  );
});

export default router;
