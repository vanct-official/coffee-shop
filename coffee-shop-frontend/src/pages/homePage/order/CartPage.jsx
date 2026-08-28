import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, Star, ShoppingCart, Heart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import toppingService from "@/services/toppingService";
import productService from "@/services/productService";
import flashSaleService from "@/services/flashSaleService";
import { toast } from "sonner";
import { useStoreHours } from "@/hooks/useStoreHours";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import CartSuccessModal from "@/pages/homePage/order/CartSuccessModal";
import QuickViewModal from "@/pages/homePage/product/QuickViewModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CartPage() {
  useDocumentTitle("Giỏ hàng");
  const navigate = useNavigate();
  const { isOpen: isStoreOpen, nextOpenMessage } = useStoreHours();
  const { cart, updateToppings, updateQuantity, updateItemSize, removeTopping, removeItem, clearCart, getTotalAmount, getItemUnitPrice, getItemSubtotal } = useCartStore();
  const [allToppings, setAllToppings] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [productInfoMap, setProductInfoMap] = useState({});
  const [activeSale, setActiveSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [addedCartItem, setAddedCartItem] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    const fetchToppings = async () => {
      try {
        const res = await toppingService.getAll();
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setAllToppings(list);
      } catch (error) {
        console.error("Lỗi lấy topping:", error);
        setAllToppings([]);
      }
    };

    fetchToppings();
  }, []);

  useEffect(() => {
    flashSaleService.getCurrentActive()
      .then((res) => setActiveSale(res?.data || null))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!activeSale) {
      setTimeLeft(null);
      return;
    }
    const timer = setInterval(() => {
      const diff = new Date(activeSale.end_time) - new Date();
      if (diff > 0) {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      } else {
        setActiveSale(null);
        setTimeLeft(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSale]);

  useEffect(() => {
    const fetchSizes = async () => {
      const ids = [...new Set(cart.map((item) => item.product_id || item.id).filter(Boolean))];
      const missingIds = ids.filter(id => !productInfoMap[id]);

      if (missingIds.length === 0) return;

      const map = { ...productInfoMap };
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const res = await productService.getById(id);
            const data = res?.data?.data || res?.data || {};
            const sizes = data.sizes || [];
            map[id] = { sizes, category_id: data.category_id };
          } catch (error) {
            console.error("Lỗi lấy thông tin sản phẩm", error);
          }
        })
      );
      setProductInfoMap(map);
    };

    fetchSizes();
  }, [cart]);

  const totalAmount = getTotalAmount();

  const isToppingSelected = (item, toppingId) => {
    return Array.isArray(item.toppings)
      ? item.toppings.some((t) => Number(t.topping_id) === Number(toppingId))
      : false;
  };

  const toggleToppingForItem = (item, topping) => {
    const cartKey = item.cartKey;
    const currentToppings = Array.isArray(item.toppings) ? item.toppings : [];

    const exists = currentToppings.some(
      (t) => Number(t.topping_id) === Number(topping.id)
    );

    let nextToppings = [];

    if (exists) {
      nextToppings = currentToppings.filter(
        (t) => Number(t.topping_id) !== Number(topping.id)
      );
    } else {
      nextToppings = [
        ...currentToppings,
        {
          topping_id: Number(topping.id),
          name: topping.name,
          price: Number(topping.price) || 0,
          quantity: 1,
        },
      ];
    }

    updateToppings(cartKey, nextToppings);
  };

  const removeToppingForItem = (item, toppingId) => {
    removeTopping(item.cartKey, toppingId);
  };

  const handleSizeChange = (item, newSizeId) => {
    const productId = item.product_id || item.id;
    const info = productInfoMap[productId];
    if (!info || !info.sizes) return;

    const newSizeObj = info.sizes.find((s) => Number(s.id) === Number(newSizeId));
    if (!newSizeObj) return;

    let newPrice = Number(newSizeObj.price);

    if (activeSale && activeSale.product_ids?.includes(Number(productId))) {
      newPrice = Math.round(newPrice * (1 - activeSale.discount_percent / 100));
    }

    updateItemSize(item.cartKey, newSizeObj.id, newSizeObj.size, newPrice);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <section className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col">
        <div className="w-full mx-auto flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap shrink-0">
            <h1 className="text-2xl md:text-2xl font-bold font-serif text-primary">Giỏ hàng</h1>

            <div className="flex gap-3 shrink-0">
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  onClick={() => setIsClearDialogOpen(true)}
                >
                  Xóa tất cả
                </Button>
              )}
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center pt-8 w-full">
              <div className="text-center py-16 px-6 w-full flex flex-col items-center justify-center bg-card rounded-3xl border border-dashed border-border">
                <div className="w-24 h-24 bg-accent/15 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="text-md font-semibold text-foreground mb-5">
                  Giỏ hàng của bạn đang trống
                </h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                  Giỏ hàng đang kêu réo vì trống trơn. Khám phá bộ sưu tập đồ uống và chọn món bạn yêu thích ngay nhé!
                </p>
                <Button
                  onClick={() => navigate("/products")}
                  size="lg"
                  className="bg-primary hover:bg-accent text-primary-foreground rounded-full px-8 shadow-md shadow-primary/20"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Xem Menu ngay
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => {
                  const cartKey = item.cartKey;
                  const unitPrice = getItemUnitPrice(item);
                  const itemTotal = getItemSubtotal(item);
                  const isEditing = editingIndex === index;

                  return (
                    <div
                      key={`cart-item-${item.productSizeId || item.id}-${index}`}
                      className="border border-border/60 rounded-2xl p-5 bg-card"
                    >
                      <div className="flex gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={item.image || item.image_url || item.thumbnail || item.product_image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"}
                            alt={item.name}
                            onClick={() => navigate(`/${item.slug || 'products/' + (item.product_id || item.id)}`)}
                            className="w-24 h-24 text-gray-900 dark:text-gray-100 rounded-xl object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                          {activeSale && activeSale.product_ids?.includes(Number(item.product_id || item.id)) && (
                            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm overflow-hidden whitespace-nowrap z-10 animate-pulse">
                              -{activeSale.discount_percent}%
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <h3
                                className="text-lg font-bold font-serif cursor-pointer hover:text-accent transition-colors text-foreground"
                                onClick={() => navigate(`/${item.slug || 'products/' + (item.product_id || item.id)}`)}
                              >
                                {item.name}
                              </h3>
                              {activeSale && timeLeft && activeSale.product_ids?.includes(Number(item.product_id || item.id)) && (
                                <div className="mt-1 text-xs text-accent font-medium">
                                  🔥 Flash sale sẽ kết thúc trong {timeLeft}
                                </div>
                              )}

                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Size:</span>
                                {productInfoMap[item.product_id || item.id]?.sizes?.length > 0 ? (
                                  <select
                                    value={item.productSizeId || item.product_size_id}
                                    onChange={(e) => handleSizeChange(item, e.target.value)}
                                    className="border border-border rounded px-2 py-1 text-sm bg-secondary outline-none hover:border-accent transition-colors cursor-pointer text-foreground font-medium"
                                  >
                                    {productInfoMap[item.product_id || item.id].sizes.map(size => (
                                      <option key={size.id} value={size.id}>
                                        {size.size}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-sm text-foreground font-medium">{item.size}</span>
                                )}
                              </div>

                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Giá gốc:{" "}
                                {Number(
                                  item.basePrice || item.price
                                ).toLocaleString("vi-VN")}
                                đ
                              </p>
                            </div>

                            <div className="font-bold text-foreground whitespace-nowrap">
                              {itemTotal.toLocaleString("vi-VN")}đ
                            </div>
                          </div>

                          {Array.isArray(item.toppings) &&
                            item.toppings.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between pr-2 mb-2">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Topping:
                                  </p>
                                  {!isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateToppings(cartKey, []);
                                      }}
                                      className="text-destructive hover:text-destructive/80 text-[11px] font-bold transition-colors uppercase"
                                      title="Xóa tất cả topping"
                                    >
                                      Xóa tất cả
                                    </button>
                                  )}
                                </div>

                                <div className="space-y-1 mt-1 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                  {item.toppings.map((topping) => (
                                    <div
                                      key={topping.topping_id}
                                      className="flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400"
                                    >
                                      <span className="break-words">
                                        - {topping.name} (
                                        {Number(topping.price).toLocaleString(
                                          "vi-VN"
                                        )}
                                        đ)
                                      </span>

                                      {!isEditing && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeToppingForItem(
                                              item,
                                              topping.topping_id
                                            )
                                          }
                                          className="text-muted-foreground hover:text-destructive shrink-0 bg-secondary p-1 rounded-md border border-border shadow-sm transition-colors"
                                          title="Xóa topping"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          <p className="text-accent font-semibold mt-3">
                            Đơn giá: {unitPrice.toLocaleString("vi-VN")}đ
                          </p>

                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                const nextQty = Math.max(
                                  1,
                                  Number(item.quantity) - 1
                                );
                                updateQuantity(cartKey, nextQty);
                              }}
                              className="w-10 h-10 border border-border bg-card text-foreground rounded-lg hover:bg-secondary text-lg transition-colors"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const nextQty = Math.max(
                                  1,
                                  Number(e.target.value) || 1
                                );
                                updateQuantity(cartKey, nextQty);
                              }}
                              className="w-16 h-10 border border-border bg-card text-foreground rounded-lg text-center"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const nextQty = Number(item.quantity) + 1;
                                updateQuantity(cartKey, nextQty);
                              }}
                              className="w-10 h-10 border border-border bg-card text-foreground rounded-lg hover:bg-secondary text-lg transition-colors"
                            >
                              +
                            </button>

                            {allToppings.filter(t => {
                              let ids = t.category_ids || [];
                              if (typeof ids === 'string') {
                                try { ids = JSON.parse(ids); } catch(e) { ids = []; }
                              }
                              return Array.isArray(ids) && ids.includes(productInfoMap[item.product_id || item.id]?.category_id);
                            }).length > 0 && (
                               <button
                                  type="button"
                                  onClick={() =>
                                    setEditingIndex(isEditing ? null : index)
                                  }
                                  className="text-accent text-sm font-semibold hover:underline px-2"
                                >
                                  {isEditing ? "Đóng thêm topping" : "Thêm topping"}
                                </button>
                            )}

                            <div className="flex items-center gap-2 ml-auto border-l pl-3 dark:border-gray-800">
                              <button
                                  type="button"
                                  onClick={() => {
                                    removeItem(cartKey);
                                    if (editingIndex === index) {
                                      setEditingIndex(null);
                                    }
                                  }}
                                  className="w-10 h-10 flex items-center justify-center border border-border bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/25 transition shadow-sm"
                                  title="Xóa khỏi giỏ hàng"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-4 border-t pt-4">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            Chọn topping
                          </p>

                          <div className="max-h-[280px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {allToppings.filter(t => {
                              let ids = t.category_ids || [];
                              if (typeof ids === 'string') {
                                try { ids = JSON.parse(ids); } catch(e) { ids = []; }
                              }
                              return Array.isArray(ids) && ids.includes(productInfoMap[item.product_id || item.id]?.category_id);
                            }).map((topping) => {
                              const checked = isToppingSelected(
                                item,
                                topping.id
                              );

                              return (
                                 <div
                                  key={topping.id}
                                  className="border border-border bg-secondary/50 rounded-2xl p-4"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleToppingForItem(item, topping)
                                        }
                                        className="w-4 h-4 shrink-0"
                                      />

                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 break-words">
                                          {topping.name}
                                        </p>
                                         <p className="text-sm text-accent font-semibold">
                                           +
                                           {Number(topping.price).toLocaleString(
                                             "vi-VN"
                                           )}
                                           đ
                                         </p>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border border-border rounded-2xl p-5 h-fit bg-card lg:sticky lg:top-24">
                <h2 className="text-lg font-bold font-serif text-foreground mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="flex justify-between text-foreground mb-3 font-medium">
                  <span>Tổng tiền</span>
                  <span className="font-bold text-accent text-lg">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                 {!isStoreOpen && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-center gap-2">
                    <span className="font-medium text-sm">Cửa hàng hiện đang đóng cửa. {nextOpenMessage}. Xin quý khách thông cảm.</span>
                  </div>
                )}

                 <Button
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-accent text-primary-foreground disabled:bg-gray-400 disabled:opacity-100 font-semibold"
                  onClick={() => navigate("/checkout")}
                  disabled={!isStoreOpen}
                >
                  <span>{isStoreOpen ? "Tiến hành thanh toán" : "Đóng cửa"}</span>
                  {isStoreOpen && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <CartSuccessModal addedCartItem={addedCartItem} onClose={() => setAddedCartItem(null)} />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        activeSale={activeSale}
        isStoreOpen={isStoreOpen}
        nextOpenMessage={nextOpenMessage}
        notifySuccess={(item) => setAddedCartItem(item)}
      />

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
             <AlertDialogAction
              className="bg-destructive hover:bg-destructive/95 text-destructive-foreground"
              onClick={() => {
                clearCart();
                toast.success("Đã làm trống giỏ hàng");
                setIsClearDialogOpen(false);
              }}
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
