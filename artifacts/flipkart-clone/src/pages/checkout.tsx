import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldCheck, Check } from "lucide-react";
import { 
  useGetCart,
  useCreateOrder,
  getGetCartQueryKey,
  getListOrdersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Valid 10-digit phone number is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Valid 6-digit pincode is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1); // 1 = Address, 2 = Payment
  
  const { data: cart, isLoading: isLoadingCart } = useGetCart();
  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "Rahul Kumar",
      phone: "9876543210",
      pincode: "560001",
      addressLine1: "123, Tech Park, Outer Ring Road",
      addressLine2: "",
      city: "Bangalore",
      state: "Karnataka",
    },
  });

  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Redirect if empty
  useEffect(() => {
    if (!isLoadingCart && (!cart || cart.items.length === 0)) {
      setLocation("/cart");
    }
  }, [cart, isLoadingCart, setLocation]);

  const onAddressSubmit = (data: z.infer<typeof addressSchema>) => {
    setStep(2);
  };

  const handlePlaceOrder = () => {
    const addressData = form.getValues();
    
    createOrder.mutate(
      { 
        data: {
          shippingAddress: addressData,
          paymentMethod
        }
      },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          setLocation(`/order-confirmation/${order.id}`);
        },
        onError: () => {
          toast.error("Failed to place order. Please try again.");
        }
      }
    );
  };

  if (isLoadingCart || !cart || cart.items.length === 0) return null;

  const totalOriginalPrice = cart.items.reduce(
    (sum, item) => sum + (item.product.originalPrice * item.quantity), 0
  );
  const totalDiscount = totalOriginalPrice - cart.subtotal;

  return (
    <PageLayout>
      <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="grid md:grid-cols-[1fr_350px] gap-6">
            
            {/* Left Column - Steps */}
            <div className="space-y-4">
              
              {/* Step 1: Login / User info (static for this demo) */}
              <Card className="rounded-sm border-0 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-4 bg-white">
                  <div className="bg-gray-100 text-primary font-medium w-6 h-6 rounded-sm flex items-center justify-center text-sm">1</div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <div className="text-gray-500 uppercase tracking-wide text-sm font-medium mb-1">Login</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Rahul Kumar</span>
                        <span className="text-sm font-medium">+919876543210</span>
                      </div>
                    </div>
                    <Check className="text-primary w-5 h-5" />
                  </div>
                </div>
              </Card>

              {/* Step 2: Delivery Address */}
              <Card className="rounded-sm border-0 shadow-sm overflow-hidden bg-white">
                <div className={`p-4 flex items-center gap-4 ${step === 1 ? 'bg-primary text-white' : 'bg-white'}`}>
                  <div className={`${step === 1 ? 'bg-white text-primary' : 'bg-gray-100 text-primary'} font-medium w-6 h-6 rounded-sm flex items-center justify-center text-sm`}>2</div>
                  <div className="uppercase tracking-wide text-sm font-medium">Delivery Address</div>
                  {step === 2 && <Check className="text-primary w-5 h-5 ml-auto" />}
                </div>

                {step === 1 ? (
                  <div className="p-6 bg-blue-50/30">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input placeholder="Name" className="h-12 bg-white" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input placeholder="10-digit mobile number" className="h-12 bg-white" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input placeholder="Pincode" className="h-12 bg-white" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input placeholder="City/District/Town" className="h-12 bg-white" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="addressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <textarea 
                                  placeholder="Address (Area and Street)" 
                                  className="w-full flex min-h-[80px] rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input placeholder="State" className="h-12 bg-white" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <Button type="submit" className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white rounded-sm px-10 py-6 text-base font-bold uppercase tracking-wider">
                            Deliver Here
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="p-4 bg-white border-t text-sm">
                    <span className="font-bold mr-2">{form.getValues().fullName}</span>
                    <span className="mr-2">{form.getValues().addressLine1}, {form.getValues().city}, {form.getValues().state} - <span className="font-bold">{form.getValues().pincode}</span></span>
                    <button className="text-primary font-medium border border-border px-4 py-1 ml-4 rounded-sm" onClick={() => setStep(1)}>Change</button>
                  </div>
                )}
              </Card>

              {/* Step 3: Order Summary */}
              <Card className="rounded-sm border-0 shadow-sm overflow-hidden bg-white">
                <div className="p-4 flex items-center gap-4 bg-white border-b">
                  <div className="bg-gray-100 text-primary font-medium w-6 h-6 rounded-sm flex items-center justify-center text-sm">3</div>
                  <div className="uppercase tracking-wide text-sm font-medium text-gray-500">Order Summary</div>
                  <Check className="text-primary w-5 h-5 ml-auto" />
                </div>
                <div className="p-4 bg-white text-sm font-medium">
                  {cart.itemCount} Item{cart.itemCount > 1 ? 's' : ''}
                </div>
              </Card>

              {/* Step 4: Payment Options */}
              <Card className="rounded-sm border-0 shadow-sm overflow-hidden bg-white">
                <div className={`p-4 flex items-center gap-4 ${step === 2 ? 'bg-primary text-white' : 'bg-white'}`}>
                  <div className={`${step === 2 ? 'bg-white text-primary' : 'bg-gray-100 text-primary'} font-medium w-6 h-6 rounded-sm flex items-center justify-center text-sm`}>4</div>
                  <div className="uppercase tracking-wide text-sm font-medium">Payment Options</div>
                </div>

                {step === 2 && (
                  <div className="bg-white">
                    <RadioGroup 
                      value={paymentMethod} 
                      onValueChange={setPaymentMethod}
                      className="gap-0"
                    >
                      <div className={`p-4 border-b ${paymentMethod === 'upi' ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="upi" id="upi" />
                          <Label htmlFor="upi" className="font-medium text-base flex items-center gap-2">
                            UPI
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-none ml-2">Recommended</Badge>
                          </Label>
                        </div>
                      </div>
                      
                      <div className={`p-4 border-b ${paymentMethod === 'card' ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="font-medium text-base">Credit / Debit / ATM Card</Label>
                        </div>
                      </div>
                      
                      <div className={`p-4 border-b ${paymentMethod === 'cod' ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="font-medium text-base">Cash on Delivery</Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="p-4 flex justify-between items-center bg-white border-t sticky bottom-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                      <div className="font-bold text-lg">
                        ₹{cart.total.toLocaleString("en-IN")}
                      </div>
                      <Button 
                        className="bg-[#fb641b] hover:bg-[#fb641b]/90 text-white rounded-sm px-10 py-6 text-base font-bold uppercase tracking-wider"
                        onClick={handlePlaceOrder}
                        disabled={createOrder.isPending}
                      >
                        {createOrder.isPending ? "Processing..." : "Confirm Order"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

            </div>

            {/* Right Column - Price Summary */}
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
                    <span>Total Payable</span>
                    <span>₹{cart.total.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <Separator className="my-2 border-dashed" />
                  
                  <div className="text-green-600 font-medium text-sm pt-2">
                    Your Total Savings on this order ₹{totalDiscount.toLocaleString("en-IN")}
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
