import { useParams, Link } from "wouter";
import { CheckCircle2, Package, MapPin, CreditCard, ChevronRight } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function OrderConfirmation() {
  const { id } = useParams();
  const orderId = parseInt(id || "0", 10);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderQueryKey(orderId)
    }
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-64 w-full rounded-sm mb-6" />
          <Skeleton className="h-96 w-full rounded-sm" />
        </div>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const orderDate = new Date(order.createdAt);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 3); // Estimate 3 days delivery

  return (
    <PageLayout>
      <div className="bg-gray-100 min-h-[calc(100vh-64px)] pb-10">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Success Banner */}
          <Card className="rounded-sm border-0 shadow-sm mb-6 overflow-hidden bg-white">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Order placed successfully!</h1>
              <p className="text-muted-foreground mb-6">Thank you for shopping with us.</p>
              
              <div className="bg-blue-50/50 rounded-sm p-4 w-full max-w-md border border-blue-100 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm">Order ID</span>
                  <span className="font-bold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Expected Delivery</span>
                  <span className="font-bold text-green-600">{format(deliveryDate, "MMM dd, yyyy")}</span>
                </div>
              </div>

              <Link href="/orders">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-sm px-8 font-medium">
                  View Order Details
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <Card className="rounded-sm border-0 shadow-sm bg-white h-full">
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                </h3>
              </div>
              <div className="p-6">
                <p className="font-bold mb-1">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-sm text-gray-700 font-medium mt-4">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="rounded-sm border-0 shadow-sm bg-white h-full">
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment Summary
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium uppercase">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                  <span>Amount Paid</span>
                  <span className="text-lg">₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Items List */}
          <Card className="rounded-sm border-0 shadow-sm bg-white mt-6 overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Ordered Items
              </h3>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <Link href={`/product/${item.productId}`}>
                    <div className="w-20 h-20 flex items-center justify-center shrink-0 cursor-pointer">
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/product/${item.productId}`}>
                      <h4 className="font-medium hover:text-primary cursor-pointer line-clamp-1">{item.productName}</h4>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    <p className="font-bold mt-2">₹{item.priceAtPurchase.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-blue-50/50 border-t flex justify-between items-center text-sm font-medium">
              <Link href="/">
                <span className="text-primary flex items-center hover:underline cursor-pointer">
                  Continue Shopping <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
            </div>
          </Card>

        </div>
      </div>
    </PageLayout>
  );
}
