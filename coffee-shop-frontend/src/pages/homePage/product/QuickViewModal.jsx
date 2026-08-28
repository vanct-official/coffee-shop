import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Zap, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import toppingService from "@/services/toppingService";
import { useCartStore } from "@/store/useCartStore";

export default function QuickViewModal({ product, isOpen, onClose, activeSale, isStoreOpen, nextOpenMessage, notifySuccess }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isToppingExpanded, setIsToppingExpanded] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setSelectedToppings([]);
      setActiveImageIndex(0);
      setIsToppingExpanded(false);
      // Select the lowest active price size
      let defaultSize = null;
      if (product.sizes && product.sizes.length > 0) {
        const dSize = product.sizes.find(s => String(s.size).trim().toUpperCase() === "S");
        if (dSize && Number(dSize.price) > 0) {
          defaultSize = dSize.id;
        } else {
          const validSizes = product.sizes.filter(s => Number(s.price) > 0).sort((a,b) => Number(a.price) - Number(b.price));
          defaultSize = validSizes[0]?.id || product.sizes[0]?.id;
        }
      }
      setSelectedSize(defaultSize);

      setLoading(true);
      toppingService.getAll()
        .then((res) => {
          const list = res?.data || [];
          const activeToppings = list.filter(t => !t.is_deleted || t.is_deleted === 0 || t.is_deleted === '0');
          setToppings(activeToppings);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, product]);

  const selectedSizeObj = useMemo(() => {
    if (!product || !selectedSize || !product.sizes) return null;
    return product.sizes.find((s) => s.id === selectedSize) || product.sizes[0];
  }, [product, selectedSize]);

  const availableToppings = useMemo(() => {
    if (!product || !product.category_id) return [];
    return toppings.filter((t) => {
      let ids = t.category_ids || [];
      if (typeof ids === 'string') {
        try { ids = JSON.parse(ids); } catch(e) { ids = []; }
      }
      return Array.isArray(ids) && ids.includes(product.category_id);
    });
  }, [toppings, product?.category_id]);

  // Pricing calculations
  const isFlashSale = activeSale && activeSale.product_ids?.includes(product?.id);
  const flashSaleDiscount = activeSale?.discount_percent || 0;

  const currentPrice = useMemo(() => {
    if (!selectedSizeObj) return 0;
    let price = Number(selectedSizeObj.price);
    if (isFlashSale) price = Math.round(price * (1 - flashSaleDiscount / 100));
    return price;
  }, [selectedSizeObj, isFlashSale, flashSaleDiscount]);

  const originalPrice = useMemo(() => {
    if (!selectedSizeObj) return 0;
    return Number(selectedSizeObj.price);
  }, [selectedSizeObj]);

  const totalPrice = useMemo(() => {
    const toppingTotal = selectedToppings.reduce(
      (sum, top) => sum + Number(top.price) * Number(top.quantity),
      0
    );
    return (currentPrice + toppingTotal) * quantity;
  }, [currentPrice, selectedToppings, quantity]);

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((item) => Number(item.topping_id) === Number(topping.id));
      if (exists) {
        return prev.filter((item) => Number(item.topping_id) !== Number(topping.id));
      }
      return [...prev, { topping_id: Number(topping.id), name: topping.name, price: Number(topping.price) || 0, quantity: 1 }];
    });
  };

  const isToppingSelected = (toppingId) => selectedToppings.some((item) => Number(item.topping_id) === Number(toppingId));

  const handleAddToCart = () => {
    if (!isStoreOpen) {
      toast.error("Cửa hàng hiện đang đóng cửa");
      return;
    }
    if (!selectedSizeObj) {
      toast.error("Vui lòng chọn size.");
      return;
    }

    const defaultImage = "https://png.pngtree.com/png-vector/20190820/ourmid/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg";
    const thumbnail = Array.isArray(product.images) ? (product.images.find(img => img.isThumbnail === 1)?.image_url || product.images[0]?.image_url || defaultImage) : defaultImage;

    const cartItem = {
      productSizeId: selectedSizeObj.id,
      id: product.id,
      product_id: product.id,
      name: product.name,
      image: thumbnail,
      size: selectedSizeObj.size,
      basePrice: currentPrice,
      price: currentPrice,
      quantity,
      toppings: selectedToppings.map(t => ({
        topping_id: Number(t.topping_id),
        name: t.name,
        price: Number(t.price),
        quantity: Number(t.quantity),
      })),
    };

    addItem(cartItem);
    if (notifySuccess) notifySuccess(cartItem);
    onClose();
  };

  if (!product) return null;

  const defaultImage = "https://png.pngtree.com/png-vector/20190820/ourmid/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg";
  const displayImages = Array.isArray(product.images) && product.images.length > 0
    ? [...product.images].sort((a, b) => b.isThumbnail - a.isThumbnail).map(img => img.image_url)
    : [product.image_url || defaultImage];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[98vw] xl:max-w-7xl p-0 overflow-hidden bg-card border border-border rounded-2xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[1000px] xl:w-[1200px] gap-0">
        <div className="flex flex-col md:flex-row h-full max-h-[92vh] md:max-h-[85vh] w-full">
          {/* Left: Image Box */}
          <div className="relative w-full md:w-1/2 lg:w-3/5 bg-secondary flex flex-col items-center p-4 md:p-10 justify-center shrink-0 md:shrink border-b md:border-b-0 md:border-r border-border">
            {isFlashSale && (
              <div className="absolute top-6 left-6 z-20 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 animate-pulse">
                <Zap className="w-4 h-4 fill-current" /> Flash Sale -{flashSaleDiscount}%
              </div>
            )}
            
            <div 
              className="w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[450px] xl:max-w-[500px] mx-auto aspect-square flex items-center justify-center relative group bg-card border border-border rounded-2xl overflow-hidden p-3 md:p-6 shadow-sm cursor-pointer"
              onClick={() => {
                onClose();
                navigate(`/${product.slug || 'products/' + product.id}`);
              }}
            >
              <img
                src={displayImages[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 md:gap-3 justify-center mt-4 md:mt-8 w-full max-w-[500px] overflow-x-auto custom-scrollbar pb-2 px-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      activeImageIndex === idx ? 'border-accent scale-110 shadow-lg ring-2 ring-accent/20' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-full p-1 bg-card">
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Box */}
          <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-stretch flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-card">
            <div className="p-5 md:p-8 flex-1 overflow-visible">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-foreground mb-2">{product.name}</h2>
              
              <div className="flex items-center gap-1.5 mb-4 opacity-80">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="text-sm font-semibold">{Number(product.rating) > 0 ? Number(product.rating).toFixed(1) : "Chưa có đánh giá"}</span>
              </div>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-2xl font-bold text-accent">
                  {currentPrice.toLocaleString("vi-VN")}đ
                </span>
                {isFlashSale && originalPrice > currentPrice && (
                  <span className="text-sm text-muted-foreground line-through font-medium mb-1">
                    {originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Kích cỡ</h3>
                <div className="flex flex-wrap gap-2">
                  {product?.sizes?.map((size) => {
                    const btnPrice = Number(size.price);
                    const isAvail = btnPrice > 0;
                    return (
                      <button
                        key={size.id}
                        disabled={!isAvail}
                        onClick={() => setSelectedSize(size.id)}
                        className={`min-w-[4rem] px-3 py-2 rounded-full border text-sm font-semibold transition-all
                          ${selectedSize === size.id 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-card text-foreground border-border hover:border-accent hover:text-accent"}
                          ${!isAvail ? "opacity-40 cursor-not-allowed bg-secondary" : ""}`}
                      >
                        {size.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toppings */}
              {availableToppings && availableToppings.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300">
                  <div 
                    className="px-5 py-4 flex justify-between items-center cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors"
                    onClick={() => setIsToppingExpanded(!isToppingExpanded)}
                  >
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                       Thêm Topping
                       {selectedToppings.length > 0 && !isToppingExpanded && (
                         <span className="text-[11px] bg-accent/15 text-accent px-2.5 py-0.5 rounded-md font-bold shadow-sm">
                           {selectedToppings.length} đã chọn
                         </span>
                       )}
                    </h3>
                    <div className="text-muted-foreground hover:text-accent transition-colors bg-card rounded-md p-1 shadow-sm border border-border">
                      {isToppingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isToppingExpanded && (
                    <div className="p-5 max-h-[260px] overflow-y-auto custom-scrollbar border-t border-border">
                      <div className="space-y-4">
                        {availableToppings.map((topping) => {
                          const selected = isToppingSelected(topping.id);
                          return (
                            <div key={topping.id} className="flex items-center justify-between space-x-2">
                              <label className="flex items-center gap-3 cursor-pointer select-none w-full">
                                <input 
                                  type="checkbox" 
                                  checked={selected}
                                  onChange={() => toggleTopping(topping)}
                                  className="w-4 h-4 text-accent focus:ring-accent rounded-md border-border cursor-pointer"
                                />
                                <span className="text-sm font-medium flex-1">{topping.name}</span>
                                <span className="text-sm text-accent font-semibold">+{(Number(topping.price)).toLocaleString("vi-VN")}đ</span>
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {!isToppingExpanded && selectedToppings.length > 0 && (
                    <div className="p-4 border-t border-border bg-secondary transition-all duration-300 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-muted-foreground">ĐÃ CHỌN</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedToppings([]); }}
                          className="text-xs text-destructive hover:text-destructive/80 font-bold transition-colors uppercase"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {selectedToppings.map(t => (
                          <div key={t.topping_id} className="flex justify-between items-center text-[13px] group">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-sm"></div>
                              {t.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-accent font-semibold">+{t.price.toLocaleString("vi-VN")}đ</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedToppings(prev => prev.filter(item => item.topping_id !== t.topping_id));
                                }}
                                className="text-gray-400 hover:text-destructive transition-colors bg-card rounded-md p-0.5 shadow-sm border border-border"
                                title="Xóa topping"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground uppercase tracking-wider">Số lượng</span>
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card shadow-sm transition-colors"><Minus className="w-4 h-4 text-foreground" /></button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-card shadow-sm transition-colors"><Plus className="w-4 h-4 text-foreground" /></button>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-0 z-10 bg-card border-t border-border p-4 md:p-6 shadow-sm">
              {isStoreOpen ? (
                <Button onClick={handleAddToCart} className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 md:h-14 rounded-xl text-base font-bold shadow-md shadow-primary/20 transition-all">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  Thêm vào giỏ hàng • {totalPrice > 0 ? totalPrice.toLocaleString("vi-VN") : 0}đ
                </Button>
              ) : (
                <div className="text-center p-3 bg-destructive/10 text-destructive rounded-xl font-bold border border-destructive/20">
                  {nextOpenMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
