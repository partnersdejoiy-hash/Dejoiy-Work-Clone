import { Router, type IRouter } from "express";
import { db, assetsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListAssetsResponse,
  CreateAssetBody,
  UpdateAssetParams,
  UpdateAssetBody,
  UpdateAssetResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/assets", async (req, res): Promise<void> => {
  const assets = await db.select().from(assetsTable);

  res.json(
    ListAssetsResponse.parse(
      assets.map((a) => ({
        ...a,
        purchaseValue: a.purchaseValue ? parseFloat(a.purchaseValue) : null,
        purchaseDate: a.purchaseDate?.toISOString(),
        createdAt: a.createdAt?.toISOString(),
      }))
    )
  );
});

router.post("/assets", async (req, res): Promise<void> => {
  const parsed = CreateAssetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [asset] = await db
    .insert(assetsTable)
    .values({
      ...parsed.data,
      purchaseValue: parsed.data.purchaseValue?.toString(),
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
    })
    .returning();

  res.status(201).json(
    UpdateAssetResponse.parse({
      ...asset,
      purchaseValue: asset.purchaseValue ? parseFloat(asset.purchaseValue) : null,
      purchaseDate: asset.purchaseDate?.toISOString(),
      createdAt: asset.createdAt?.toISOString(),
    })
  );
});

router.patch("/assets/:id", async (req, res): Promise<void> => {
  const params = UpdateAssetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAssetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [asset] = await db
    .update(assetsTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(assetsTable.id, params.data.id))
    .returning();

  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.json(
    UpdateAssetResponse.parse({
      ...asset,
      purchaseValue: asset.purchaseValue ? parseFloat(asset.purchaseValue) : null,
      purchaseDate: asset.purchaseDate?.toISOString(),
      createdAt: asset.createdAt?.toISOString(),
    })
  );
});

export default router;
