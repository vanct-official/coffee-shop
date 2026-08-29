import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Coffee, Search, Edit, Trash2 } from 'lucide-react';
import toppingService from '../../../services/toppingService';
import useFetch from '../../../hooks/useFetch';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import PaginationControl from '../../../components/common/PaginationControl';
import CreateTopping from './Action/CreateTopping';
import UpdateTopping from './Action/UpdateTopping';
import DeleteTopping from './Action/DeleteTopping';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminToppings() {
  useDocumentTitle('Quản lý topping | Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

  // Fetch toppings
  const fetchToppings = useCallback(() => {
    return toppingService.getAll();
  }, []);

  const {
    data: response,
    loading,
    error,
    execute: refetch,
  } = useFetch(fetchToppings);

  const toppings = response?.data?.filter((t) => t.is_deleted === 0) || [];

  // Search Filter
  const filteredToppings = useMemo(() => {
    if (!Array.isArray(toppings)) return [];
    let result = toppings.filter((t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortOrder === 'price_desc') {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOrder === 'price_asc') {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    }

    return result;
  }, [toppings, searchQuery, sortOrder]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredToppings.length / PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredToppings.length, totalPages, currentPage]);

  const currentToppings = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredToppings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredToppings, currentPage]);

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title="Quản lý Topping"
        subtitle="Danh sách topping thêm cho đồ uống và món ăn"
        icon={Coffee}
        actions={
          <Button onClick={() => openModal('create')} className='cursor-pointer shadow-xs'>
            <Plus className='w-4 h-4 mr-2' />
            Thêm topping
          </Button>
        }
      />

      {/* ===== SEARCH & SORT ===== */}
      <div className='mb-4 flex flex-col sm:flex-row gap-3'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute left-3 top-2.5 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm topping...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className='pl-9'
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[200px]"
        >
          <option value="">Sắp xếp mặc định</option>
          <option value="price_desc">Giá (Cao - Thấp)</option>
          <option value="price_asc">Giá (Thấp - Cao)</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <div className='bg-card rounded-xl border border-border overflow-hidden shadow-xs'>
        {/* Desktop Table View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[60px]">STT</TableHead>
                <TableHead className="min-w-[180px]">Tên topping</TableHead>
                <TableHead className="text-center min-w-[120px]">Áp dụng</TableHead>
                <TableHead className="text-center min-w-[130px]">Giá</TableHead>
                <TableHead className="text-center min-w-[140px]">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-6'>Đang tải...</TableCell>
                </TableRow>
              )}
              {!loading && filteredToppings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-6'>Không có topping nào</TableCell>
                </TableRow>
              )}
              {!loading && currentToppings.map((topping, idx) => (
                <TableRow key={topping.id}>
                  <TableCell className="text-center font-medium">{(currentPage - 1) * PAGE_SIZE + idx + 1}</TableCell>
                  <TableCell>{topping.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={topping.category_ids && topping.category_ids.length > 0 ? 'secondary' : 'outline'}>
                      {topping.category_ids ? (typeof topping.category_ids === 'string' ? JSON.parse(topping.category_ids).length : topping.category_ids.length) || 0 : 0} danh mục
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-primary">{Number(topping.price).toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center gap-1'>
                      <Button variant='ghost' size='sm' className='cursor-pointer' title="Chỉnh sửa" onClick={() => openModal('update', topping)}>
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button variant='ghost' size='sm' className='text-destructive cursor-pointer hover:text-red-600' title="Xóa" onClick={() => openModal('delete', topping)}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card List View (md:hidden) */}
        <div className="md:hidden divide-y divide-border/60">
          {loading && (
            <div className="p-6 text-center text-muted-foreground text-sm">Đang tải...</div>
          )}
          {!loading && filteredToppings.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">Không có topping nào</div>
          )}
          {!loading && currentToppings.map((topping, idx) => {
            const catCount = topping.category_ids
              ? (typeof topping.category_ids === 'string' ? JSON.parse(topping.category_ids).length : topping.category_ids.length) || 0
              : 0;

            return (
              <div key={`mob-top-${topping.id}`} className="p-4 space-y-2.5 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">#{(currentPage - 1) * PAGE_SIZE + idx + 1}</span>
                      <h4 className="font-bold text-sm text-foreground">{topping.name}</h4>
                    </div>
                    <Badge variant={catCount > 0 ? 'secondary' : 'outline'} className="text-[11px] mt-1">
                      Áp dụng: {catCount} danh mục
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-primary whitespace-nowrap">
                    {Number(topping.price).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => openModal('update', topping)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    onClick={() => openModal('delete', topping)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredToppings.length}
        itemsPerPage={PAGE_SIZE}
        itemName="topping"
      />

      {/* ===== MODALS ===== */}
      {modal.type === 'create' && (
        <CreateTopping
          open={true}
          onClose={closeModal}
          onSuccess={() => {
            refetch();
            closeModal();
          }}
        />
      )}

      {modal.type === 'update' && (
        <UpdateTopping
          topping={modal.data}
          open={true}
          onClose={closeModal}
          onSuccess={refetch}
        />
      )}

      {modal.type === 'delete' && (
        <DeleteTopping
          topping={modal.data}
          open={true}
          onClose={closeModal}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
