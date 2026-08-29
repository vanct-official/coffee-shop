import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Search,
  Trash2,
  Edit,
  Plus,
  Tag
} from "lucide-react";
import discountService from "@/services/discountService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PaginationControl from "@/components/common/PaginationControl";
import AdminDiscountModal from "./AdminDiscountModal";
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
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminDiscounts() {
  useDocumentTitle('Quản lý khuyến mãi | Admin');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingId, setLoadingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const abortRef = useRef(null);

  const PAGE_SIZE = 7;

  const fetchDiscounts = async (
    currentPage = page,
    search = keyword,
    status = statusFilter
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const res = await discountService.getAll(
        {
          page: currentPage,
          limit: PAGE_SIZE,
          code: search,
          status,
        },
        controller.signal
      );

      const payload = res?.data || res;

      setData(payload.items || []);
      setTotalPages(payload.totalPages || 1);
      setTotalItems(payload.total || payload.totalCount || 0);
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        console.error("Lỗi lấy danh sách discount:", err);
        setError("Không thể tải danh sách mã giảm giá");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDiscounts(page, keyword, statusFilter);
    }, 600);

    return () => clearTimeout(timeout);
  }, [keyword, statusFilter, page]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      setLoadingId(deleteId);
      setIsDeleteDialogOpen(false);
      await discountService.delete(deleteId);
      toast.success("Xóa mã giảm giá thành công");
      await fetchDiscounts(page, keyword, statusFilter);
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi xóa mã giảm giá");
    } finally {
      setLoadingId(null);
      setDeleteId(null);
    }
  };

  const getStatusInfo = (item) => {
    const now = Date.now();
    const startTime = item.valid_from
      ? new Date(item.valid_from).getTime()
      : null;
    const endTime = item.valid_until
      ? new Date(item.valid_until).getTime()
      : null;

    if (startTime && now < startTime) {
      return {
        text: "Sắp diễn ra",
        variant: "outline",
      };
    }

    if (endTime && now >= endTime) {
      return {
        text: "Hết hạn",
        variant: "destructive",
      };
    }

    return {
      text: "Còn hiệu lực",
      variant: "secondary",
    };
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString("vi-VN") + "đ";
  };

  if (error && data.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Lỗi: {error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => fetchDiscounts(1, "", "")}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  const discountToDelete = data.find((item) => item.id === deleteId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Khuyến mãi"
        subtitle="Cấu hình voucher giảm giá, mã khuyến mãi và điều kiện áp dụng"
        icon={Tag}
        actions={
          <Button onClick={() => {
            setSelectedDiscountId(null);
            setIsModalOpen(true);
          }} className="cursor-pointer shadow-xs">
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        }
      />

      {/* FILTER */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo code, mô tả hoặc %..."
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
              className="pl-9"
            />
          </div>

          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Còn hiệu lực</option>
            <option value="expired">Hết hạn</option>
            <option value="upcoming">Sắp diễn ra</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="relative bg-card rounded-xl border border-border overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-[60px]">STT</TableHead>
                    <TableHead className="min-w-[180px]">Mã giảm giá</TableHead>
                    <TableHead className="text-center min-w-[100px]">%</TableHead>
                    <TableHead className="text-center min-w-[130px]">
                      Đơn tối thiểu
                    </TableHead>
                    <TableHead className="text-center min-w-[130px]">
                      Giảm tối đa
                    </TableHead>
                    <TableHead className="text-center min-w-[120px]">
                      Sử dụng
                    </TableHead>
                    <TableHead className="text-center min-w-[120px]">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-center min-w-[140px]">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Không có mã giảm giá nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, index) => {
                      const status = getStatusInfo(item);
                      const stt = (page - 1) * PAGE_SIZE + index + 1;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="text-center font-medium">
                            {stt}
                          </TableCell>
                          <TableCell>
                            <div className="font-mono font-medium">{item.code}</div>
                          </TableCell>

                          <TableCell className="text-center font-bold text-primary">
                            {Number(item.percentage || 0)}%
                          </TableCell>

                          <TableCell className="text-center">
                            {formatMoney(item.min_order_amount)}
                          </TableCell>

                          <TableCell className="text-center">
                            {formatMoney(item.max_discount_amount)}
                          </TableCell>

                          <TableCell className="text-center">
                            {Number(item.used_count || 0)} /{" "}
                            {item.usage_limit == null
                              ? "∞"
                              : Number(item.usage_limit)}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant={status.variant}
                              className="inline-flex min-w-[110px] justify-center"
                            >
                              {status.text}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDiscountId(item.id);
                                  setIsModalOpen(true);
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(item.id)}
                                disabled={loadingId === item.id}
                                title="Xóa"
                                className="hover:text-red-600"
                              >
                                {loadingId === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View (md:hidden) */}
            <div className="md:hidden divide-y divide-border/60">
              {data.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Không có mã giảm giá nào
                </div>
              ) : (
                data.map((item, index) => {
                  const status = getStatusInfo(item);
                  const stt = (page - 1) * PAGE_SIZE + index + 1;

                  return (
                    <div key={`mob-disc-${item.id}`} className="p-4 space-y-3 bg-card">
                      {/* Top row: Code + % + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">#{stt}</span>
                            <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {item.code}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              -{Number(item.percentage || 0)}%
                            </span>
                          </div>
                        </div>

                        <Badge variant={status.variant} className="text-[11px]">
                          {status.text}
                        </Badge>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/40">
                        <div>
                          <span className="text-muted-foreground">Đơn tối thiểu:</span>
                          <p className="font-medium text-foreground mt-0.5">{formatMoney(item.min_order_amount)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Giảm tối đa:</span>
                          <p className="font-medium text-foreground mt-0.5">{formatMoney(item.max_discount_amount)}</p>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-border/40 flex justify-between">
                          <span className="text-muted-foreground">Đã dùng:</span>
                          <span className="font-semibold text-foreground">
                            {Number(item.used_count || 0)} / {item.usage_limit == null ? "Không giới hạn" : Number(item.usage_limit)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => {
                            setSelectedDiscountId(item.id);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                          onClick={() => handleDeleteClick(item.id)}
                          disabled={loadingId === item.id}
                        >
                          {loadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Xóa
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && (
        <PaginationControl
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={PAGE_SIZE}
          itemName="mã giảm giá"
        />
      )}

      <AdminDiscountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDiscountId(null);
        }}
        discountId={selectedDiscountId}
        onSuccess={() => fetchDiscounts(page, keyword, statusFilter)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá <strong>{discountToDelete?.code}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId && deleteId !== null}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loadingId && deleteId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
