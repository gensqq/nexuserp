"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Receipt,
  ScanBarcode,
  Package,
} from "lucide-react";
import { posAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 56.50 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rate: 7.82 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 155.0 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.37 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.50 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.25 },
];

interface CartItem {
  product: any;
  quantity: number;
  total: number;
}

export default function POSPage() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("posCurrency") || "USD";
    return "USD";
  });

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatPrice = (amount: number) => {
    const converted = amount * currencyInfo.rate;
    return `${currencyInfo.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem("posCurrency", code);
    addToast({ title: "Currency Changed", message: `POS now shows in ${code}`, type: "success" });
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const data = await posAPI.getProducts(searchQuery, selectedCategory);
      setProducts(data.products || []);
      setCategories(["All", ...(data.categories || [])]);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      addToast({ title: "Out of Stock", message: `${product.name} is out of stock`, type: "warning" });
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        addToast({ title: "Insufficient Stock", message: `Only ${product.stock} available`, type: "warning" });
        return;
      }
      setCart(cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * product.price }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, total: product.price }]);
    }
    addToast({ title: "Added to Cart", message: product.name, type: "success" });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty > item.product.stock) {
          addToast({ title: "Insufficient Stock", message: `Only ${item.product.stock} available`, type: "warning" });
          return item;
        }
        return newQty === 0 ? null : { ...item, quantity: newQty, total: newQty * item.product.price };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) {
      addToast({ title: "Empty Cart", message: "Add items to cart first", type: "warning" });
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        paymentMethod,
      };

      const result = await posAPI.createOrder(orderData);
      addToast({ title: "Order Created", message: `Order ${result.order.orderNumber} - Total: ${formatPrice(result.order.total)}`, type: "success" });
      setCart([]);
      fetchProducts(); // Refresh stock
    } catch (error: any) {
      addToast({ title: "Checkout Failed", message: error.message, type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <p className="text-muted-foreground">Process sales and manage transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Currency:</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-20 bg-muted rounded-lg" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${product.stock <= 0 ? "opacity-50" : ""}`}
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="w-full h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                      <Badge variant={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "destructive"} className="text-xs">
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Cart
                </CardTitle>
                <Badge variant="secondary">{cart.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Cart is empty</p>
                  <p className="text-xs">Click on products to add them</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} each</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, -1); }}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, 1); }}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{formatPrice(item.total)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-border/50">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleCheckout("cash")} disabled={processing}>
                      <Banknote className="w-4 h-4 mr-1" /> Cash
                    </Button>
                    <Button className="w-full" onClick={() => handleCheckout("card")} disabled={processing}>
                      <CreditCard className="w-4 h-4 mr-1" /> Card
                    </Button>
                  </div>

                  <Button variant="ghost" className="w-full" size="sm" onClick={() => {
                    addToast({ title: "Receipt", message: "Receipt printed successfully", type: "success" });
                  }}>
                    <Receipt className="w-4 h-4 mr-1" /> Print Receipt
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
