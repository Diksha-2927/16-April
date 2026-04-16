import { useLocation, useParams } from "wouter";
import { Star, ShoppingCart, Zap, Tag, ShieldCheck, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetProduct, 
  useAddToCart,
  getGetProductQueryKey,
  getGetCartQueryKey
} from "@workspace/api-client-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
      queryKey: getGetProductQueryKey(productId)
    }
  });

  const addToCart = useAddToCart();
  const [emblaRef] = useEmblaCarousel({ loop: true });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
          });
        }
      }
    );
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setLocation("/checkout");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-6 bg-white min-h-[calc(100vh-64px)]">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-sm" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-1/3" />
              <div className="flex gap-4 pt-6">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => setLocation("/")}>Back to Home</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-white min-h-[calc(100vh-64px)] pb-20">
        {/* Breadcrumb */}
        <div className="border-b border-border/50 py-3 hidden md:block">
          <div className="container mx-auto px-4 flex items-center text-sm text-muted-foreground">
            <span className="hover:text-primary cursor-pointer" onClick={() => setLocation("/")}>Home</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="hover:text-primary cursor-pointer" onClick={() => setLocation(`/?category=${product.category}`)}>{product.category}</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground truncate">{product.name}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Images & Actions */}
            <div className="flex flex-col gap-4">
              <div className="border rounded-sm p-4 relative bg-white flex items-center justify-center group overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm shadow-sm border-gray-200 text-gray-500 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </Button>
                </div>
                <div className="embla overflow-hidden w-full aspect-square" ref={emblaRef}>
                  <div className="embla__container flex h-full">
                    {product.images.map((url, i) => (
                      <div className="embla__slide flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-4" key={i}>
                        <img 
                          src={url} 
                          alt={`${product.name} - Image ${i + 1}`} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sticky bottom-0 z-20 bg-white p-2 border-t md:border-none md:p-0 md:static">
                <Button 
                  size="lg" 
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base py-6 rounded-sm uppercase tracking-wide font-bold shadow-md"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white text-base py-6 rounded-sm uppercase tracking-wide font-bold shadow-md"
                  onClick={handleBuyNow}
                  disabled={addToCart.isPending || product.stock === 0}
                >
                  <Zap className="w-5 h-5 mr-2 fill-current" />
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="flex flex-col">
              <p className="text-muted-foreground text-sm font-medium mb-1">{product.brand}</p>
              <h1 className="text-xl md:text-2xl text-foreground font-medium mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center bg-green-600 text-white text-sm font-bold px-2 py-0.5 rounded-sm">
                  {product.rating.toFixed(1)} <Star className="w-4 h-4 ml-1 fill-current" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{product.reviewCount} Ratings & Reviews</span>
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="Assured" className="h-5 ml-2" />
              </div>

              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold">₹{product.price.toLocaleString("en-IN")}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-muted-foreground line-through mb-1">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                    <span className="text-green-600 font-bold mb-1">{product.discountPercent}% off</span>
                  </>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-6">Inclusive of all taxes</p>

              {/* Offers */}
              <div className="mb-6 space-y-3">
                <h3 className="font-bold flex items-center gap-2">Available offers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span><span className="font-medium">Bank Offer:</span> 5% Cashback on Flipkart Axis Bank Card</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span><span className="font-medium">Special Price:</span> Get extra {product.discountPercent}% off (price inclusive of cashback/coupon)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span><span className="font-medium">Partner Offer:</span> Sign up for Flipkart Pay Later and get Flipkart Gift Card worth up to ₹500*</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm mb-6 pb-6 border-b">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="font-medium">1 Year Warranty from the Date of Purchase</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Product Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <div className="border border-border rounded-sm overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                      <h3 className="text-lg font-bold">Specifications</h3>
                    </div>
                    <div className="p-4 bg-white">
                      <h4 className="font-medium mb-4 pb-2 border-b">General</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, value], i) => (
                            <tr key={i} className="flex py-2 border-b border-border/30 last:border-0">
                              <td className="w-1/3 text-muted-foreground">{key}</td>
                              <td className="w-2/3 text-foreground">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
