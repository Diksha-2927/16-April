import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateOrderNumber(): string {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return `OD${now}${rand}`;
}

async function buildOrderResponse(order: typeof ordersTable.$inferSelect) {
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
      productName: item.productName,
      productImage: item.productImage,
    })),
    shippingAddress: order.shippingAddress,
    subtotal: order.subtotal,
    total: order.total,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  const result = await Promise.all(orders.map(buildOrderResponse));
  res.json(result);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { shippingAddress, paymentMethod } = parsed.data;

  const cartRows = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      product: productsTable,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id));

  const cartItems = cartRows.filter((r) => r.product !== null);

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product!.price * item.quantity,
    0
  );
  const total = subtotal;

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber: generateOrderNumber(),
      status: "confirmed",
      shippingAddress,
      subtotal,
      total,
      paymentMethod,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.product!.price,
      productName: item.product!.name,
      productImage: item.product!.images[0] ?? "",
    }))
  );

  await db.delete(cartItemsTable);

  const result = await buildOrderResponse(order);
  res.status(201).json(result);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const result = await buildOrderResponse(order);
  res.json(result);
});

export default router;
