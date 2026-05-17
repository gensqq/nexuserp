"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Truck,
  ArrowUpDown,
  Download,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { inventoryAPI } from "@/utils/api";
import { useToast } from "@/components/ui/toast";
import { exportToCSV } from "@/lib/utils";

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

const poStatusColors: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "info",
  RECEIVED: "success",
  CANCELLED: "destructive",
};

export default function InventoryPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"products" | "suppliers" | "orders">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddPO, setShowAddPO] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", price: "", cost: "", stock: "", minStock: "", category: "" });
  const [newSupplier, setNewSupplier] = useState({ name: "", email: "", phone: "", address: "" });
  const [newPO, setNewPO] = useState({ supplierId: "", expectedDate: "", notes: "", items: [{ productName: "", quantity: "1", unitCost: "" }] });
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("inventoryCurrency") || "USD";
    return "USD";
  });

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const formatMoney = (amount: number) => {
    const converted = amount * currencyInfo.rate;
    return `${currencyInfo.symbol}${converted?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    localStorage.setItem("inventoryCurrency", code);
    addToast({ title: "Currency Changed", message: `Inventory now shows in ${code}`, type: "success" });
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      const [productsData, suppliersData, poData] = await Promise.all([
        inventoryAPI.getProducts(searchQuery),
        inventoryAPI.getSuppliers(),
        inventoryAPI.getPurchaseOrders(),
      ]);
      setProducts(productsData.products || []);
      setSuppliers(suppliersData.suppliers || []);
      setPurchaseOrders(poData.purchaseOrders || []);
    } catch (error) {
      console.error("Inventory fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      addToast({ title: "Validation Error", message: "Name, SKU, and price are required", type: "warning" });
      return;
    }
    try {
      await inventoryAPI.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        cost: parseFloat(newProduct.cost) || 0,
        stock: parseInt(newProduct.stock) || 0,
        minStock: parseInt(newProduct.minStock) || 0,
      });
      addToast({ title: "Product Added", message: newProduct.name, type: "success" });
      setNewProduct({ name: "", sku: "", price: "", cost: "", stock: "", minStock: "", category: "" });
      setShowAddProduct(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) {
      addToast({ title: "Validation Error", message: "Supplier name is required", type: "warning" });
      return;
    }
    try {
      await inventoryAPI.createSupplier(newSupplier);
      addToast({ title: "Supplier Added", message: newSupplier.name, type: "success" });
      setNewSupplier({ name: "", email: "", phone: "", address: "" });
      setShowAddSupplier(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleCreatePO = async () => {
    if (!newPO.supplierId) {
      addToast({ title: "Validation Error", message: "Supplier is required", type: "warning" });
      return;
    }
    const validItems = newPO.items.filter((i) => i.productName && i.quantity && i.unitCost);
    if (!validItems.length) {
      addToast({ title: "Validation Error", message: "At least one item with name, quantity, and cost is required", type: "warning" });
      return;
    }
    try {
      await inventoryAPI.createPurchaseOrder({
        supplierId: newPO.supplierId,
        expectedDate: newPO.expectedDate || undefined,
        notes: newPO.notes || undefined,
        items: validItems.map((i) => ({ productName: i.productName, quantity: parseInt(i.quantity), unitCost: parseFloat(i.unitCost) })),
      });
      addToast({ title: "Purchase Order Created", message: "Order placed successfully", type: "success" });
      setNewPO({ supplierId: "", expectedDate: "", notes: "", items: [{ productName: "", quantity: "1", unitCost: "" }] });
      setShowAddPO(false);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleUpdatePOStatus = async (id: string, status: string) => {
    try {
      await inventoryAPI.updatePurchaseOrder({ id, status });
      addToast({ title: "Order Updated", message: `Status changed to ${status}`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeletePO = async (id: string) => {
    if (!confirm("Delete this purchase order?")) return;
    try {
      await inventoryAPI.deletePurchaseOrder(id);
      addToast({ title: "Deleted", message: "Purchase order removed", type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return;
    try {
      await inventoryAPI.deleteProduct(id);
      addToast({ title: "Deleted", message: `${name} removed`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    try {
      await inventoryAPI.deleteSupplier(id);
      addToast({ title: "Deleted", message: `${name} removed`, type: "success" });
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.sku || !editingProduct?.price) {
      addToast({ title: "Validation Error", message: "Name, SKU, and price are required", type: "warning" });
      return;
    }
    try {
      await inventoryAPI.updateProduct({
        id: editingProduct.id,
        name: editingProduct.name,
        sku: editingProduct.sku,
        price: parseFloat(editingProduct.price),
        cost: parseFloat(editingProduct.cost) || 0,
        stock: parseInt(editingProduct.stock) || 0,
        minStock: parseInt(editingProduct.minStock) || 0,
        category: editingProduct.category,
      });
      addToast({ title: "Product Updated", message: editingProduct.name, type: "success" });
      setEditingProduct(null);
      fetchData();
    } catch (error: any) {
      addToast({ title: "Error", message: error.message, type: "error" });
    }
  };

  const handleExport = () => {
    if (activeTab === "products") {
      exportToCSV(
        ["Name", "SKU", "Category", "Price", "Cost", "Stock", "Min Stock"],
        products.map((p) => [p.name, p.sku, p.category || "", p.price, p.cost || 0, p.stock, p.minStock]),
        "inventory-products"
      );
    } else if (activeTab === "suppliers") {
      exportToCSV(
        ["Name", "Email", "Phone", "Address", "Active"],
        suppliers.map((s) => [s.name, s.email || "", s.phone || "", s.address || "", s.isActive ? "Yes" : "No"]),
        "inventory-suppliers"
      );
    } else {
      exportToCSV(
        ["Order #", "Supplier", "Status", "Total", "Expected Date", "Notes"],
        purchaseOrders.map((po) => [po.orderNumber, po.supplier?.name || "", po.status, po.total, po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "", po.notes || ""]),
        "purchase-orders"
      );
    }
    addToast({ title: "Exported", message: `${activeTab} exported as CSV`, type: "success" });
  };

  const addPOItem = () => {
    setNewPO({ ...newPO, items: [...newPO.items, { productName: "", quantity: "1", unitCost: "" }] });
  };

  const removePOItem = (index: number) => {
    setNewPO({ ...newPO, items: newPO.items.filter((_, i) => i !== index) });
  };

  const updatePOItem = (index: number, field: string, value: string) => {
    const items = [...newPO.items];
    items[index] = { ...items[index], [field]: value };
    setNewPO({ ...newPO, items });
  };

  const lowStockCount = products.filter((p) => p.stock < p.minStock).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage stock, suppliers, and purchase orders</p>
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowAddProduct(true)}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
          <Button size="sm" variant="outline" onClick={() => setShowAddSupplier(true)}><Plus className="w-4 h-4 mr-1" /> Add Supplier</Button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddProduct && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add Product</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input placeholder="Product name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input placeholder="WM001" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input placeholder="Electronics" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input type="number" placeholder="29.99" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost</label>
                <Input type="number" placeholder="15.00" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Stock</label>
                <Input type="number" placeholder="100" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Stock</label>
                <Input type="number" placeholder="20" value={newProduct.minStock} onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddProduct}>Save Product</Button>
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <Card>
          <CardHeader><CardTitle className="text-base">Edit Product</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input placeholder="Product name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input placeholder="WM001" value={editingProduct.sku} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input placeholder="Electronics" value={editingProduct.category || ""} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input type="number" placeholder="29.99" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost</label>
                <Input type="number" placeholder="15.00" value={editingProduct.cost || ""} onChange={(e) => setEditingProduct({ ...editingProduct, cost: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" placeholder="100" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Stock</label>
                <Input type="number" placeholder="20" value={editingProduct.minStock || ""} onChange={(e) => setEditingProduct({ ...editingProduct, minStock: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleEditProduct}>Update Product</Button>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Supplier Form */}
      {showAddSupplier && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add Supplier</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input placeholder="Supplier name" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="supplier@example.com" value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+1 555-0100" value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input placeholder="123 Supplier St" value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddSupplier}>Save Supplier</Button>
              <Button variant="outline" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Purchase Order Form */}
      {showAddPO && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Purchase Order</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier *</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={newPO.supplierId} onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}>
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Date</label>
                <Input type="date" value={newPO.expectedDate} onChange={(e) => setNewPO({ ...newPO, expectedDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input placeholder="Optional notes" value={newPO.notes} onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Items</label>
                <Button variant="outline" size="sm" onClick={addPOItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
              </div>
              {newPO.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_100px_120px_40px] gap-2 items-end">
                  <div>
                    <Input placeholder="Product name" value={item.productName} onChange={(e) => updatePOItem(idx, "productName", e.target.value)} />
                  </div>
                  <div>
                    <Input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={(e) => updatePOItem(idx, "quantity", e.target.value)} />
                  </div>
                  <div>
                    <Input type="number" placeholder="Unit cost" min="0" step="0.01" value={item.unitCost} onChange={(e) => updatePOItem(idx, "unitCost", e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500" onClick={() => removePOItem(idx)} disabled={newPO.items.length === 1}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {newPO.items.some((i) => i.quantity && i.unitCost) && (
                <div className="text-right text-sm font-medium">
                  Total: {formatMoney(newPO.items.reduce((sum, i) => sum + (parseInt(i.quantity || "0") * parseFloat(i.unitCost || "0")), 0))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreatePO}>Create Order</Button>
              <Button variant="outline" onClick={() => setShowAddPO(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Products</p><p className="text-2xl font-bold">{products.length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-blue-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Total Stock</p><p className="text-2xl font-bold">{totalStock.toLocaleString()}</p></div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><ArrowUpDown className="w-5 h-5 text-emerald-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Low Stock Alerts</p><p className="text-2xl font-bold text-amber-500">{lowStockCount}</p></div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted-foreground">Suppliers</p><p className="text-2xl font-bold">{suppliers.length}</p></div>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><Truck className="w-5 h-5 text-violet-500" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-2">
        {(["products", "suppliers", "orders"] as const).map((tab) => (
          <Button key={tab} variant={activeTab === tab ? "default" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
        {activeTab === "orders" && (
          <Button size="sm" className="ml-auto" onClick={() => setShowAddPO(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Purchase Order
          </Button>
        )}
      </div>

      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products found</td></tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                        <td className="p-4 text-sm font-medium">{product.name}</td>
                        <td className="p-4 text-sm font-mono">{product.sku}</td>
                        <td className="p-4"><Badge variant="secondary">{product.category || "-"}</Badge></td>
                        <td className="p-4 text-sm font-medium text-right">{formatMoney(product.price)}</td>
                        <td className="p-4 text-right">
                          <span className={product.stock < product.minStock ? "text-amber-500 font-medium" : ""}>{product.stock}</span>
                          <span className="text-xs text-muted-foreground"> / min {product.minStock}</span>
                        </td>
                        <td className="p-4">
                          {product.stock < product.minStock ? (
                            <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3 h-3" /> Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProduct({ ...product, price: String(product.price), cost: String(product.cost || ""), stock: String(product.stock), minStock: String(product.minStock || "") })}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteProduct(product.id, product.name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </div>
      )}

      {activeTab === "suppliers" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </CardContent></Card>
            ))
          ) : suppliers.length === 0 ? (
            <Card className="col-span-3"><CardContent className="p-8 text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">No suppliers yet. Add your first supplier!</p>
            </CardContent></Card>
          ) : (
            suppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{supplier.name}</h3>
                    <Badge variant={supplier.isActive ? "success" : "secondary"}>{supplier.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {supplier.email && <p>{supplier.email}</p>}
                    {supplier.phone && <p>{supplier.phone}</p>}
                    <p>{supplier.purchaseOrders?.length || 0} orders</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => addToast({ title: "Edit", message: "Edit supplier", type: "info" })}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-4">
          {loading ? (
            <Card><CardContent className="p-6"><div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
            </div></CardContent></Card>
          ) : purchaseOrders.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">No purchase orders yet</p>
              <Button onClick={() => setShowAddPO(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create Purchase Order
              </Button>
            </CardContent></Card>
          ) : (
            <Card><CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order #</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expected</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => (
                      <tr key={po.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                        <td className="p-4 text-sm font-mono font-medium">{po.orderNumber}</td>
                        <td className="p-4 text-sm">{po.supplier?.name || "-"}</td>
                        <td className="p-4 text-sm">{po.items?.length || 0} items</td>
                        <td className="p-4 text-sm font-medium text-right">{formatMoney(po.total)}</td>
                        <td className="p-4"><Badge variant={poStatusColors[po.status] as any}>{po.status}</Badge></td>
                        <td className="p-4 text-sm text-muted-foreground">{po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "-"}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {po.status === "DRAFT" && (
                              <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleUpdatePOStatus(po.id, "SENT")}>
                                <Clock className="w-3 h-3 mr-1" /> Send
                              </Button>
                            )}
                            {po.status === "SENT" && (
                              <Button variant="ghost" size="sm" className="text-xs text-emerald-500" onClick={() => handleUpdatePOStatus(po.id, "RECEIVED")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Receive
                              </Button>
                            )}
                            {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                              <Button variant="ghost" size="sm" className="text-xs text-red-500" onClick={() => handleUpdatePOStatus(po.id, "CANCELLED")}>
                                <XCircle className="w-3 h-3 mr-1" /> Cancel
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeletePO(po.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent></Card>
          )}
        </div>
      )}
    </div>
  );
}
