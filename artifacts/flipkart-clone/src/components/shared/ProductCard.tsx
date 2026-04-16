import { Link } from "wouter";
import { Star } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border border-border/50 group overflow-hidden bg-card rounded-sm flex flex-col">
        <div className="relative p-4 flex-shrink-0 flex items-center justify-center bg-white h-48">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <CardContent className="p-4 flex flex-col flex-1 gap-2 border-t border-border/20">
          <div>
            <h3 className="font-medium text-sm text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
              {product.rating.toFixed(1)} <Star className="w-3 h-3 ml-0.5 fill-current" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">({product.reviewCount})</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-base">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                <span className="text-xs font-bold text-green-600">{product.discountPercent}% off</span>
              </>
            )}
          </div>
          {product.stock < 10 && product.stock > 0 && (
            <p className="text-[10px] text-destructive font-medium mt-1">Only {product.stock} left in stock</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
