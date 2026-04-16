import { useState, FormEvent, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Search, ShoppingCart, User, Package } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialSearch = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const { data: cart } = useGetCart();
  const cartItemCount = cart?.itemCount || 0;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation(`/`);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 w-full shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex flex-col items-center flex-shrink-0">
          <span className="text-xl font-bold italic tracking-tight">Flipkart</span>
          <span className="text-[10px] text-gray-200 -mt-1 hover:underline flex items-center gap-1">
            Explore <span className="text-secondary font-bold">Plus</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden sm:flex">
          <Input
            type="search"
            placeholder="Search for products, brands and more"
            className="w-full bg-white text-black pl-4 pr-10 rounded-sm border-none shadow-sm h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-10 w-10 text-primary hover:bg-transparent"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>

        <div className="flex items-center gap-2 md:gap-6 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-primary/90 hover:text-white rounded-sm font-medium gap-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Rahul Kumar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <Link href="/orders">
                <DropdownMenuItem className="cursor-pointer py-3">
                  <Package className="h-4 w-4 mr-3 text-primary" />
                  <span>Orders</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/cart" className="flex items-center gap-2 text-white font-medium hover:text-gray-100">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-primary">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder="Search for products..."
            className="w-full bg-white text-black pl-4 pr-10 rounded-sm border-none h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-10 w-10 text-primary hover:bg-transparent"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
