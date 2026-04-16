import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveFromCartParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildCartResponse() {
  const rows = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      product: productsTable,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id));

  const items = rows
    .filter((r) => r.product !== null)
    .map((r) => ({
      id: r.id,
      productId: r.productId,
      quantity: r.quantity,
      product: {
        ...r.product!,
        specifications: (r.product!.specifications ?? {}) as Record<string, string>,
        createdAt: r.product!.createdAt.toISOString(),
      },
    }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, total, itemCount };
}

router.get("/cart", async (_req, res): Promise<void> => {
  const cart = await buildCartResponse();
  res.json(cart);
});

router.post("/cart", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity } = parsed.data;

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.productId, productId));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.productId, productId));
  } else {
    await db.insert(cartItemsTable).values({ productId, quantity });
  }

  const cart = await buildCartResponse();
  res.json(cart);
});

router.put("/cart/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = UpdateCartItemParams.safeParse({ productId: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quantity } = parsed.data;

  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.productId, params.data.productId));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(eq(cartItemsTable.productId, params.data.productId));
  }

  const cart = await buildCartResponse();
  res.json(cart);
});

router.delete("/cart/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = RemoveFromCartParams.safeParse({ productId: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.productId, params.data.productId));

  const cart = await buildCartResponse();
  res.json(cart);
});

router.delete("/cart", async (_req, res): Promise<void> => {
  await db.delete(cartItemsTable);
  const cart = await buildCartResponse();
  res.json(cart);
});

export default router;
