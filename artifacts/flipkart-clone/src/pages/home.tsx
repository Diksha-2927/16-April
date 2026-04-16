import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { 
  useListProducts, 
  useListCategories,
  useGetFeaturedProducts
} from "@workspace/api-client-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Home() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const search = searchParams.get("search") || undefined;
  const initialCategory = searchParams.get("category") || undefined;
  
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useListProducts({ 
    search, 
    category: selectedCategory 
  });
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();

  const handleCategoryClick = (slug?: string) => {
    setSelectedCategory(slug === selectedCategory ? undefined : slug);
  };

  return (
    <PageLayout>
      {/* Category Nav */}
      <div className="bg-white shadow-sm border-b overflow-hidden">
        <div className="container mx-auto px-4 py-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 p-1">
              {isLoadingCategories ? (
                Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))
              ) : (
                <>
                  <button
                    onClick={() => handleCategoryClick(undefined)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      !selectedCategory 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All
                  </button>
                  {categoriesData?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </>
              )}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8 flex-1">
        {/* Banner area */}
        {!search && !selectedCategory && (
          <div className="rounded-sm overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 aspect-[4/1] md:aspect-[6/1] flex items-center px-8 md:px-16 shadow-md relative">
            <div className="z-10 text-white max-w-lg">
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary border-none mb-4 font-bold rounded-sm px-3 py-1">Big Saving Days</Badge>
              <h2 className="text-2xl md:text-5xl font-bold mb-2 tracking-tight">Top Deals on Electronics</h2>
              <p className="text-blue-100 md:text-xl font-medium">Up to 80% Off + 10% Instant Discount</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 md:opacity-100 pointer-events-none translate-y-[20%] translate-x-[10%]">
              <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFFFFF" d="M42.7,-73.4C55.9,-65.4,67.6,-53.8,75.9,-40.4C84.3,-27,89.3,-11.9,87.6,2.6C86,17.2,77.7,31.2,67.6,43.2C57.4,55.2,45.4,65.3,31.6,71.2C17.7,77.1,2.1,78.8,-12.3,76.1C-26.7,73.4,-39.9,66.4,-51.9,57C-63.9,47.6,-74.6,35.8,-80.7,21.9C-86.8,8.1,-88.4,-7.8,-83.4,-21.9C-78.4,-36.1,-66.8,-48.5,-53.8,-56.9C-40.9,-65.4,-26.6,-70,-11.7,-72.1C3.1,-74.1,18.4,-73.5,29.8,-74.2" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {search && (
          <div className="bg-white p-4 shadow-sm rounded-sm border">
            <h2 className="text-lg font-medium">
              Showing results for <span className="font-bold">"{search}"</span>
            </h2>
            <p className="text-sm text-muted-foreground">{productsData?.total || 0} products found</p>
          </div>
        )}

        {/* Featured Products (only on home without filters) */}
        {!search && !selectedCategory && featuredProducts && featuredProducts.length > 0 && (
          <section className="bg-white p-4 shadow-sm rounded-sm border border-border/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trending Offers</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Main Product Grid */}
        <section className="bg-white p-4 shadow-sm rounded-sm border border-border/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {search ? 'Search Results' : selectedCategory ? 'Category Products' : 'All Products'}
            </h2>
          </div>
          
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="h-80 border rounded-sm p-4 flex flex-col">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-1/3 mt-auto" />
                </div>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-24 h-24 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinelinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sorry, no results found!</h3>
              <p className="text-muted-foreground">Please check the spelling or try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {productsData?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
