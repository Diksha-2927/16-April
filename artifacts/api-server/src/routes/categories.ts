import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(productsTable.category);

  const categories = rows.map((row, i) => ({
    id: i + 1,
    name: row.category,
    slug: row.category.toLowerCase().replace(/\s+/g, "-"),
    productCount: Number(row.count),
  }));

  res.json(categories);
});

export default router;
