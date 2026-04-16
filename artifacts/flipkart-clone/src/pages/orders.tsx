import { Link } from "wouter";
import { Package, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useListOrders } from "@workspace/api-client-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-600 text-white';
      case 'confirmed': return 'bg-blue-600 text-white';
      case 'shipped': return 'bg-[#fb641b] text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const getStatusText = (status: string, date: string) => {
    const formattedDate = format(new Date(date), "MMM dd, yyyy");
    switch (status) {
      case 'delivered': return `Delivered on ${formattedDate}`;
      case 'confirmed': return `Confirmed on ${formattedDate}`;
      case 'shipped': return `Shipped on ${formattedDate}`;
      case 'cancelled': return `Cancelled on ${formattedDate}`;
      default: return `Ordered on ${formattedDate}`;
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="grid md:grid-cols-[250px_1fr] gap-6">
            <Skeleton className="h-64 w-full rounded-sm" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-sm" />
              <Skeleton className="h-32 w-full rounded-sm" />
              <Skeleton className="h-32 w-full rounded-sm" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-gray-100 min-h-[calc(100vh-64px)] pb-10">
        {/* Breadcrumb */}
        <div className="bg-white border-b py-2 hidden md:block mb-4 shadow-sm">
          <div className="container mx-auto px-4 max-w-5xl flex items-center text-xs text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <Link href="/account" className="hover:text-primary">My Account</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-primary">My Orders</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-2 max-w-5xl">
          <div className="grid md:grid-cols-[250px_1fr] gap-6">
            
            {/* Filters Sidebar */}
            <div className="hidden md:block">
              <Card className="rounded-sm border-0 shadow-sm overflow-hidden bg-white sticky top-20">
                <div className="p-4 border-b font-medium text-lg">Filters</div>
                
                <div className="p-4 border-b">
                  <h3 className="font-medium text-sm mb-3 uppercase text-gray-500">Order Status</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>On the way</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>Delivered</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>Cancelled</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>Returned</span>
                    </label>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-sm mb-3 uppercase text-gray-500">Order Time</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>Last 30 days</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>2024</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-primary" />
                      <span>2023</span>
                    </label>
                  </div>
                </div>
              </Card>
            </div>

            {/* Orders List */}
            <div className="flex flex-col gap-4">
              
              {/* Search Orders */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    type="search" 
                    placeholder="Search your orders here" 
                    className="w-full bg-white h-11 pl-4 rounded-sm border-border"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-sm px-6 h-11 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search Orders</span>
                </Button>
                <Button variant="outline" className="h-11 w-11 p-0 rounded-sm md:hidden flex items-center justify-center bg-white">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {!orders || orders.length === 0 ? (
                <Card className="rounded-sm border-0 shadow-sm bg-white p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-40 h-40 mb-6">
                    <img 
                      src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/myorders-empty_3b4ce8.png" 
                      alt="No orders" 
                      className="max-w-full"
                    />
                  </div>
                  <h3 className="text-xl font-medium mb-2">You have no orders</h3>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90 mt-4 rounded-sm shadow-sm px-10">Start Shopping</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="space-y-2">
                      {order.items.map((item) => (
                        <Link key={`${order.id}-${item.id}`} href={`/order-confirmation/${order.id}`}>
                          <Card className="rounded-sm border border-border/50 hover:shadow-md transition-shadow bg-white overflow-hidden cursor-pointer group">
                            <div className="p-4 sm:p-6 grid sm:grid-cols-[100px_1fr_200px] gap-4 sm:gap-6 items-center">
                              
                              {/* Image */}
                              <div className="w-20 h-20 mx-auto sm:w-full sm:h-24 flex items-center justify-center">
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex flex-col gap-1 text-center sm:text-left">
                                <h3 className="font-medium text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                                  {item.productName}
                                </h3>
                                <p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p>
                              </div>

                              {/* Price & Status */}
                              <div className="flex flex-col items-center sm:items-end gap-2">
                                <span className="font-bold">₹{item.priceAtPurchase.toLocaleString("en-IN")}</span>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-primary'}`}></div>
                                  <span className="font-medium text-sm">{getStatusText(order.status, order.createdAt)}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Your item has been {order.status}</span>
                              </div>

                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
