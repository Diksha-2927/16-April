import { useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { 
  useGetCart, 
  useUpdateCartItem,
  useRemoveFromCart,
  getGetCartQueryKey
} from "@workspace/api-client-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Cart() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    updateCartItem.mutate(
      { productId, data: { quantity: newQuantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  const handleRemove = (productId: number) => {
    removeFromCart.mutate(
      { productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast.success("Item removed from cart");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid md:grid-cols-[1fr_350px] gap-6">
            <div className="space-y-4">
              <Card className="p-4 rounded-sm">
                <Skeleton className="h-32 w-full" />
              </Card>
              <Card className="p-4 rounded-sm">
                <Skeleton className="h-32 w-full" />
              </Card>
            </div>
            <Card className="p-4 h-fit rounded-sm">
              <Skeleton className="h-64 w-full" />
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl h-full flex items-center justify-center">
          <Card className="w-full py-16 px-4 flex flex-col items-center justify-center rounded-sm text-center shadow-sm">
            <div className="mb-6 w-48 h-40">
              <img 
                src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png" 
                alt="Empty Cart" 
                className="w-full h-full object-contain opacity-80"
              />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty!</h2>
            <p className="text-muted-foreground text-sm mb-6">Add items to it now.</p>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white rounded-sm px-16 shadow-md"
              onClick={() => setLocation("/")}
            >
              Shop now
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Calculate total original price to show discount
  const totalOriginalPrice = cart.items.reduce(
    (sum, item) => sum + (item.product.originalPrice * item.quantity), 0
  );
  const totalDiscount = totalOriginalPrice - cart.subtotal;

  return (
    <PageLayout>
      <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="grid md:grid-cols-[1fr_350px] gap-6 items-start">
            {/* Cart Items List */}
            <div className="space-y-4">
              <Card className="rounded-sm shadow-sm border-0 overflow-hidden bg-white">
                <div className="p-4 border-b border-border/50 bg-white sticky top-0 z-10 flex justify-between items-center">
                  <h2 className="text-lg font-medium">My Cart ({cart.itemCount})</h2>
                  <div className="flex items-center text-sm gap-2">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Safe and Secure Payments. Easy returns.</span>
                  </div>
                </div>

                <div className="divide-y divide-border/50">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 bg-white hover:bg-gray-50/50 transition-colors">
                      {/* Image */}
                      <Link href={`/product/${item.product.id}`} className="w-full sm:w-28 shrink-0 flex items-center justify-center bg-white cursor-pointer">
                        <div className="h-28 relative">
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-medium hover:text-primary cursor-pointer line-clamp-1">{item.product.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{item.product.brand}</p>
                        
                        <div className="flex items-end gap-3 mt-4">
                          {item.product.originalPrice > item.product.price && (
                            <span className="text-sm text-muted-foreground line-through">₹{item.product.originalPrice.toLocaleString("en-IN")}</span>
                          )}
                          <span className="text-xl font-bold">₹{item.product.price.toLocaleString("en-IN")}</span>
                          {item.product.originalPrice > item.product.price && (
                            <span className="text-sm font-bold text-green-600">{item.product.discountPercent}% Off</span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mt-6">
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-7 w-7 rounded-full disabled:opacity-50"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateCartItem.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-10 h-7 border flex items-center justify-center text-sm font-medium">
                              {item.quantity}
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-7 w-7 rounded-full disabled:opacity-50"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock || updateCartItem.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <button 
                            className="text-base font-medium hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wide"
                            onClick={() => handleRemove(item.productId)}
                            disabled={removeFromCart.isPending}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 flex justify-end">
                  <Button 
                    className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white rounded-sm px-10 py-6 text-base font-bold uppercase tracking-wider w-full md:w-auto shadow-md"
                    onClick={() => setLocation("/checkout")}
                  >
                    Place Order
                  </Button>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="sticky top-20">
              <Card className="rounded-sm shadow-sm border-0">
                <div className="p-4 border-b border-border/50 bg-white">
                  <h2 className="uppercase font-medium text-gray-500 tracking-wide text-sm">Price Details</h2>
                </div>
                
                <div className="p-4 space-y-4 bg-white text-[15px]">
                  <div className="flex justify-between">
                    <span>Price ({cart.itemCount} items)</span>
                    <span>₹{totalOriginalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>− ₹{totalDiscount.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <Separator className="my-2 border-dashed" />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{cart.total.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <Separator className="my-2 border-dashed" />
                  
                  <div className="text-green-600 font-medium text-sm pt-2">
                    You will save ₹{totalDiscount.toLocaleString("en-IN")} on this order
                  </div>
                </div>
              </Card>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground p-2">
                <ShieldCheck className="w-6 h-6 text-gray-400" />
                <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
