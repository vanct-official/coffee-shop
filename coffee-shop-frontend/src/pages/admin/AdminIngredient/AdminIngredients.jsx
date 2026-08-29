import { useState, useMemo, useCallback } from 'react';
import { Plus, Package, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ingredientService from '../../../services/ingredientService';
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

import CreateIngredient from './Action/CreateIngredient';
import UpdateIngredient from './Action/UpdateIngredient';
import DeleteIngredient from './Action/DeleteIngredient';
import PaginationControl from '../../../components/common/PaginationControl';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminIngredients() {
  useDocumentTitle('Quản lý nguyên liệu | Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [modal, setModal] = useState({
    type: null,
    data: null,
  });

  const openModal = (type, data = null) => {
    setModal({ type, data });
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
  };

  const fetchIngredients = useCallback(() => {
    return ingredientService.getAll();
  }, []);

  const {
    data: response,
    loading,
    error,
    execute: refetch,
    setData,
  } = useFetch(fetchIngredients);

  const ingredients = response?.data?.filter((c) => c.is_deleted === 0) || [];

  const filteredIngredients = useMemo(() => {
    if (!Array.isArray(ingredients)) return [];

    return ingredients.filter((c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [ingredients, searchQuery]);

  // Reset page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE);

  const paginatedIngredients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIngredients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredIngredients, currentPage]);

  const handleCreateSuccess = (newIngredient) => {
    setData((prev) => {
      if (!prev?.data) {
        return {
          success: true,
          data: [newIngredient],
        };
      }
      return {
        ...prev,
        data: [newIngredient, ...prev.data],
      };
    });
  };

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title="Quản lý Nguyên liệu"
        subtitle="Theo dõi định lượng, tồn kho và đơn vị tính của từng nguyên liệu"
        icon={Package}
        actions={
          <Button
            onClick={() => openModal('create')}
            className='cursor-pointer shadow-xs'
          >
            <Plus className='w-4 h-4 mr-2' />
            Thêm nguyên liệu
          </Button>
        }
      />

      {/* ===== SEARCH ===== */}
      <div className='mb-4'>
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-2.5 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm nguyên liệu...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className='bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4'>
          Có lỗi xảy ra khi tải dữ liệu
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className='bg-card rounded-xl border border-border overflow-hidden shadow-xs'>
        {/* Desktop Table View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[60px]">STT</TableHead>
                <TableHead className="min-w-[180px]">Tên nguyên liệu</TableHead>
                <TableHead className="text-center min-w-[130px]">Loại đơn vị</TableHead>
                <TableHead className="text-center min-w-[120px]">Đơn vị</TableHead>
                <TableHead className="text-center min-w-[140px]">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-6'>
                    Đang tải...
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredIngredients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-6'>
                    Không có nguyên liệu nào
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paginatedIngredients.map((ingredient, index) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="text-center font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className='font-medium'>{ingredient.name}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{ingredient.unit_type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className='text-muted-foreground font-medium'>{ingredient.unit}</div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          variant='ghost'
                          className={'cursor-pointer'}
                          size='sm'
                          title="Chỉnh sửa"
                          onClick={() => openModal('update', ingredient)}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>

                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive hover:text-red-600 cursor-pointer'
                          title="Xóa"
                          onClick={() => openModal('delete', ingredient)}
                        >
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
          {!loading && filteredIngredients.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">Không có nguyên liệu nào</div>
          )}
          {!loading &&
            paginatedIngredients.map((ingredient, index) => (
              <div key={`mob-ing-${ingredient.id}`} className="p-4 space-y-2.5 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{ingredient.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[11px]">
                        {ingredient.unit_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Đơn vị: <strong className="text-foreground">{ingredient.unit}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => openModal('update', ingredient)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    onClick={() => openModal('delete', ingredient)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ===== PAGINATION ===== */}
      {!loading && (
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredIngredients.length}
          itemsPerPage={ITEMS_PER_PAGE}
          itemName="nguyên liệu"
        />
      )}

      {/* ===== MODALS ===== */}
      {modal.type === 'create' && (
        <CreateIngredient
          open={true}
          onClose={closeModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {modal.type === 'update' && (
        <UpdateIngredient
          ingredient={modal.data}
          open={true}
          onClose={closeModal}
          onSuccess={refetch}
        />
      )}

      {modal.type === 'delete' && (
        <DeleteIngredient
          ingredient={modal.data}
          open={true}
          onClose={closeModal}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
