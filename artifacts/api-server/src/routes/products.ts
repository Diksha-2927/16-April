import { Router, type IRouter } from "express";
import { ilike, eq, and, gte, lte, sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/featured", async (_req, res): Promise<void> => {
  const featured = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isFeatured, true))
    .limit(10);

  const result = featured.map((p) => ({
    ...p,
    specifications: (p.specifications ?? {}) as Record<string, string>,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, category, minPrice, maxPrice, page, limit } = parsed.data;

  const conditions = [];
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (category) conditions.push(eq(productsTable.category, category));
  if (minPrice !== undefined) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(productsTable.price, maxPrice));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(whereClause).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  const mappedProducts = products.map((p) => ({
    ...p,
    specifications: (p.specifications ?? {}) as Record<string, string>,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json({
    products: mappedProducts,
    total,
    page,
    limit,
    totalPages,
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...product,
    specifications: (product.specifications ?? {}) as Record<string, string>,
    createdAt: product.createdAt.toISOString(),
  });
});

export default router;
