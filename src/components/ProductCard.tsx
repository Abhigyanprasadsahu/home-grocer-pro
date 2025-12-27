import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  inStock: boolean;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductCard = ({ product, quantity, onAdd, onRemove }: ProductCardProps) => {
  return (
    <div className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-soft transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30 p-4">
        {product.discount && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded">
            {product.discount}% OFF
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="min-h-[40px]">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.unit}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Add/Remove Controls */}
          {quantity === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={onAdd}
              disabled={!product.inStock}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-primary rounded-lg">
              <button
                onClick={onRemove}
                className="p-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-l-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-bold text-primary-foreground min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="p-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-r-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {!product.inStock && (
          <p className="text-xs text-destructive font-medium">Out of Stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
