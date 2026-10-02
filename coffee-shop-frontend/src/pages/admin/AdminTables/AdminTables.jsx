import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Trash2,
  Table as TableIcon,
  Loader2,
  LayoutGrid,
  MapPin,
  Edit,
  QrCode,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
import { toast } from "sonner";
import tableService from "@/services/tableService";
import areaService from "@/services/areaService";
import TableModal from "./TableModal";
import AreaModal from "../AdminAreas/AreaModal";
// import ReservationModal from "./ReservationModal";
import { STORAGE_KEYS } from "@/constants";
import { jwtDecode } from "jwt-decode";
import PaginationControl from "@/components/common/PaginationControl";
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminTables() {
  useDocumentTitle('Quản lý bàn | Admin');
  const token =
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const user = token ? jwtDecode(token) : null;
  const isStaff = user?.role_id === 2;

  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Table Modal States
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [deleteTableConfirmOpen, setDeleteTableConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Area Modal States
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [deleteAreaConfirmOpen, setDeleteAreaConfirmOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);

  // Reservation Modal States
  // const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  // const [tableToReserve, setTableToReserve] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const limit = 12;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesRes, areasRes] = await Promise.all([
        tableService.getAll({ status: selectedStatus }),
        areaService.getAll(),
      ]);
      setTables(tablesRes.data || []);
      setAreas(areasRes.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  // -- TABLE HANDLERS --
  const handleAddTable = () => {
    setSelectedTable(null);
    setIsTableModalOpen(true);
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setIsTableModalOpen(true);
  };

  const handleDeleteTableClick = (table) => {
    setTableToDelete(table);
    setDeleteTableConfirmOpen(true);
  };

  // QR Modal state
  const [qrModalTable, setQrModalTable] = useState(null);

  // Hàm xem QR
  const handleViewQR = (table) => {
    setQrModalTable(table);
  };

  // Hàm in QR
  const handlePrintQr = () => {
    if (!qrModalTable?.qrUrl) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<img src='${qrModalTable.qrUrl}' style='width:300px;height:300px;display:block;margin:auto'/>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  const handleDeleteTableConfirm = async () => {
    try {
      await tableService.delete(tableToDelete.id);
      toast.success("Xóa bàn thành công");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Xóa bàn thất bại");
    } finally {
      setDeleteTableConfirmOpen(false);
      setTableToDelete(null);
    }
  };

  const handleStatusChange = async (table, newStatus) => {
    try {
      await tableService.update(table.id, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Cập nhật thất bại");
    }
  };

  // -- AREA HANDLERS --
  const handleAddArea = () => {
    setSelectedArea(null);
    setIsAreaModalOpen(true);
  };

  const handleEditArea = (area) => {
    setSelectedArea(area);
    setIsAreaModalOpen(true);
  };

  const handleDeleteAreaClick = (area) => {
    setAreaToDelete(area);
    setDeleteAreaConfirmOpen(true);
  };

  const handleDeleteAreaConfirm = async () => {
    try {
      await areaService.delete(areaToDelete.id);
      toast.success("Xóa khu vực thành công");
      // If the deleted area was selected, reset to "all"
      if (selectedAreaId === areaToDelete.id.toString()) {
        setSelectedAreaId("all");
      }
      fetchData();
    } catch (error) {
      toast.error(error.message || "Xóa khu vực thất bại");
    } finally {
      setDeleteAreaConfirmOpen(false);
      setAreaToDelete(null);
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.code
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesArea =
      selectedAreaId === "all" || table.area_id.toString() === selectedAreaId;
    return matchesSearch && matchesArea;
  });

  const totalPages = Math.ceil(filteredTables.length / limit);
  const paginatedTables = filteredTables.slice(
    (page - 1) * limit,
    page * limit,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedAreaId]);

  const canCreateTable = selectedAreaId !== "all" && areas.length > 0;
  const currentAreaObj = areas.find((a) => a.id.toString() === selectedAreaId);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <AdminPageHeader
        title="Quản lý Khu vực & Bàn"
        subtitle="Sơ đồ bàn, khu vực và quản lý đặt bàn theo thời gian thực"
        icon={TableIcon}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
              disabled={loading}
              title="Tải lại"
              className="cursor-pointer"
            >
              <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button className="gap-2 cursor-pointer shadow-xs" variant="secondary" onClick={handleAddArea}>
              <MapPin className="w-4 h-4" />
              Thêm khu vực
            </Button>
            {canCreateTable && (
              <Button className="gap-2 cursor-pointer shadow-xs" onClick={handleAddTable}>
                <Plus className="w-4 h-4" />
                Thêm bàn mới
              </Button>
            )}
          </div>
        }
      />

      {/* FILTERS & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4 lg:col-span-3 flex flex-col md:flex-row gap-4 items-center bg-white/50 backdrop-blur-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Tìm theo mã bàn (VD: TB-01)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 w-full bg-white/50"
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-10 w-full md:w-64 bg-white/50">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Trống</SelectItem>
              <SelectItem value="occupied">Có khách</SelectItem>
              {/* <SelectItem value="reserved">Đã đặt</SelectItem> */}
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-4 flex flex-col justify-center bg-primary/5 border-primary/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              Tổng số bàn:
            </span>
            <span className="font-bold text-primary">
              {filteredTables.length}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-muted-foreground font-medium">
              Đang trống:
            </span>
            <span className="font-bold text-green-600">
              {filteredTables.filter((t) => t.status === "available").length}
            </span>
          </div>
        </Card>
      </div>

      {/* TABS FOR AREAS AND TABLES GRID */}
      <Tabs
        value={selectedAreaId}
        onValueChange={setSelectedAreaId}
        className="w-full"
      >
        <div className="overflow-x-auto pb-2 mb-4">
          <TabsList className="inline-flex h-11 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="all" className="px-4 py-2">
              Tất cả khu vực
            </TabsTrigger>
            {areas.map((area) => (
              <TabsTrigger
                key={area.id}
                value={area.id.toString()}
                className="px-4 py-2"
              >
                {area.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedAreaId} className="mt-0">
          {/* Area Actions if a specific area is selected */}
          {selectedAreaId !== "all" && currentAreaObj && (
            <div className="flex items-center justify-between bg-card border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted border flex-shrink-0 flex items-center justify-center">
                  {currentAreaObj.image ? (
                    <img
                      src={currentAreaObj.image}
                      alt={currentAreaObj.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MapPin className="w-6 h-6 opacity-50 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {currentAreaObj.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredTables.length} bàn trong khu vực này
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditArea(currentAreaObj)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa khu vực
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAreaClick(currentAreaObj)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : paginatedTables.length > 0 ? (
            <>
              {/* Mobile Card List (md:hidden) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3.5 col-span-full">
                {paginatedTables.map((table) => (
                  <Card
                    key={`mobile-${table.id}`}
                    className="p-4 flex flex-col justify-between gap-3 bg-card border border-border shadow-xs rounded-xl relative overflow-hidden"
                  >
                    {/* Status Top Strip */}
                    <div
                      className={`absolute top-0 left-0 w-full h-1 ${
                        table.status === "available"
                          ? "bg-green-500"
                          : table.status === "occupied"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                    />

                    {/* Table Info Header */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                            table.status === "available"
                              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : table.status === "occupied"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {table.code?.replace("TB-", "")}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">
                            Bàn {table.code}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {table.area_name}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                          table.status === "available"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800"
                            : table.status === "occupied"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            table.status === "available"
                              ? "bg-green-500"
                              : table.status === "occupied"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }`}
                        />
                        {table.status === "available"
                          ? "Trống"
                          : table.status === "occupied"
                            ? "Có khách"
                            : "Đã đặt"}
                      </div>
                    </div>

                    {/* Staff Status Actions (if applicable) */}
                    {isStaff && (
                      <div className="flex gap-2 w-full pt-1">
                        {table.status === "available" && (
                          <Button
                            size="sm"
                            className="w-full text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table, "occupied");
                            }}
                          >
                            Chuyển có khách
                          </Button>
                        )}
                        {table.status === "reserved" && (
                          <Button
                            size="sm"
                            className="w-full text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table, "occupied");
                            }}
                          >
                            Chuyển có khách
                          </Button>
                        )}
                        {table.status === "occupied" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(table, "available");
                            }}
                          >
                            Chuyển bàn trống
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Toolbar for Mobile */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs h-8 gap-1.5"
                        onClick={() => handleViewQR(table)}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Mã QR
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8 gap-1.5"
                        onClick={() => handleEditTable(table)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteTableClick(table)}
                        title="Xóa bàn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Grid (hidden md:grid) */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-7 col-span-full">
                {paginatedTables.map((table) => {
                  const isOccupied = table.status === "occupied";
                  const isAvailable = table.status === "available";

                  const chairBackrestClass = isOccupied
                    ? "bg-blue-300/90 dark:bg-blue-800 border-blue-400 dark:border-blue-600 shadow-2xs"
                    : isAvailable
                      ? "bg-amber-100/95 dark:bg-stone-800 border-amber-300/80 dark:border-stone-600 shadow-2xs"
                      : "bg-amber-200/90 dark:bg-amber-800 border-amber-400 dark:border-amber-600 shadow-2xs";

                  const chairCushionClass = isOccupied
                    ? "bg-blue-100 dark:bg-blue-900/90 border-blue-300 dark:border-blue-700"
                    : isAvailable
                      ? "bg-amber-50 dark:bg-stone-700 border-amber-200 dark:border-stone-600"
                      : "bg-amber-100 dark:bg-amber-900/80 border-amber-300 dark:border-amber-700";

                  const tableSurfaceClass = isOccupied
                    ? "bg-gradient-to-br from-blue-50/95 via-sky-50/40 to-indigo-50/80 dark:from-blue-950/60 dark:via-gray-900 dark:to-indigo-950/50 border-blue-500 dark:border-blue-400 shadow-md shadow-blue-500/10 hover:border-blue-600"
                    : isAvailable
                      ? "bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-green-50/70 dark:from-emerald-950/50 dark:via-gray-900 dark:to-teal-950/40 border-emerald-400/90 dark:border-emerald-500/80 shadow-sm hover:border-emerald-500"
                      : "bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-amber-100/60 dark:from-amber-950/50 dark:via-gray-900 dark:to-orange-950/40 border-amber-400/90 dark:border-amber-500/80 shadow-sm hover:border-amber-500";

                  return (
                    <div
                      key={table.id}
                      className="relative group p-3.5 flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] select-none"
                    >
                      {/* 4 CHIẾC GHẾ NGỒI QUANH BÀN */}
                      {/* Ghế TRÊN */}
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-transform duration-300 group-hover:-translate-y-1.5 z-0">
                        <div className={`w-12 sm:w-14 h-2 rounded-t-full border ${chairBackrestClass}`} />
                        <div className={`w-9 sm:w-10 h-2 -mt-[1px] rounded-b-md border-x border-b ${chairCushionClass}`} />
                      </div>

                      {/* Ghế DƯỚI */}
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-transform duration-300 group-hover:translate-y-1.5 z-0">
                        <div className={`w-9 sm:w-10 h-2 -mb-[1px] rounded-t-md border-x border-t ${chairCushionClass}`} />
                        <div className={`w-12 sm:w-14 h-2 rounded-b-full border ${chairBackrestClass}`} />
                      </div>

                      {/* Ghế TRÁI */}
                      <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 flex flex-row items-center pointer-events-none transition-transform duration-300 group-hover:-translate-x-1.5 z-0">
                        <div className={`h-12 sm:h-14 w-2 rounded-l-full border ${chairBackrestClass}`} />
                        <div className={`h-9 sm:h-10 w-2 -ml-[1px] rounded-r-md border-y border-r ${chairCushionClass}`} />
                      </div>

                      {/* Ghế PHẢI */}
                      <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 flex flex-row items-center pointer-events-none transition-transform duration-300 group-hover:translate-x-1.5 z-0">
                        <div className={`h-9 sm:h-10 w-2 -mr-[1px] rounded-l-md border-y border-l ${chairCushionClass}`} />
                        <div className={`h-12 sm:h-14 w-2 rounded-r-full border ${chairBackrestClass}`} />
                      </div>

                      {/* MẶT BÀN UỐNG NƯỚC Ở GIỮA */}
                      <div
                        className={`w-full min-h-[210px] rounded-3xl border-2 p-3.5 flex flex-col items-center justify-between gap-2 relative z-10 transition-all duration-300 ${tableSurfaceClass}`}
                      >
                        {/* Dải phân cách viền mặt bàn */}
                        <div className="absolute inset-1 rounded-[1.35rem] border border-black/5 dark:border-white/5 pointer-events-none" />

                        {/* Top Bar: Icon ly cafe & Tool buttons */}
                        <div className="w-full flex items-center justify-between z-20">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-2xs ${
                              isOccupied
                                ? "bg-blue-100/80 dark:bg-blue-900/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                : isAvailable
                                  ? "bg-emerald-100/80 dark:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-100/80 dark:bg-amber-900/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                            }`}
                            title="Bàn cafe 4 chỗ"
                          >
                            <Coffee className="w-3.5 h-3.5" />
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                              onClick={() => handleViewQR(table)}
                              title="Xem mã QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                              onClick={() => handleEditTable(table)}
                              title="Sửa bàn"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteTableClick(table)}
                              title="Xóa bàn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* TÂM MẶT BÀN: Biển số bàn */}
                        <div className="flex flex-col items-center justify-center my-1 z-20">
                          <div
                            className={`min-w-[4.25rem] h-12 px-3 rounded-2xl flex flex-col items-center justify-center border shadow-xs transition-colors duration-300 ${
                              isAvailable
                                ? "bg-white/90 dark:bg-gray-800/90 border-emerald-200 dark:border-emerald-800/60"
                                : isOccupied
                                  ? "bg-white/95 dark:bg-gray-800/90 border-blue-200 dark:border-blue-800/60"
                                  : "bg-white/90 dark:bg-gray-800/90 border-amber-200 dark:border-amber-800/60"
                            }`}
                          >
                            <span
                              className={`text-xl font-black tracking-tight whitespace-nowrap leading-none ${
                                isAvailable
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : isOccupied
                                    ? "text-blue-700 dark:text-blue-400"
                                    : "text-amber-700 dark:text-amber-400"
                              }`}
                            >
                              {table.code?.replace("TB-", "")}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                              {table.code?.startsWith("TB-") ? "TB" : "BÀN"}
                            </span>
                          </div>

                          <div className="text-center mt-1.5 space-y-0.5">
                            <h3 className="text-xs font-bold text-foreground">Bàn {table.code}</h3>
                            <p className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              {table.area_name}
                            </p>
                          </div>
                        </div>

                        {/* PHẦN DƯỚI MẶT BÀN: Trạng thái & Hành động */}
                        <div className="w-full flex flex-col items-center gap-1.5 z-20">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                              isAvailable
                                ? "bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60"
                                : isOccupied
                                  ? "bg-blue-100/90 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/60"
                                  : "bg-amber-100/90 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                isAvailable
                                  ? "bg-emerald-500"
                                  : isOccupied
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                              }`}
                            />
                            {isAvailable ? "Trống (4 chỗ)" : isOccupied ? "Có khách" : "Đã đặt"}
                          </div>

                          {/* Staff Status Actions */}
                          {isStaff && (
                            <div className="flex gap-1.5 w-full justify-center mt-1">
                              {table.status === "available" && (
                                <Button
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(table, "occupied");
                                  }}
                                >
                                  Có khách
                                </Button>
                              )}
                              {table.status === "reserved" && (
                                <Button
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(table, "occupied");
                                  }}
                                >
                                  Có khách
                                </Button>
                              )}
                              {table.status === "occupied" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[11px] px-2.5 w-full border-emerald-400 text-emerald-700 hover:bg-emerald-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(table, "available");
                                  }}
                                >
                                  Bàn trống
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="col-span-full p-20 text-center flex flex-col items-center gap-4 bg-muted/30 rounded-3xl border-2 border-dashed">
              <TableIcon className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium text-lg">
                Không tìm thấy bàn nào phù hợp
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAreaId("all");
                  setSelectedStatus("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {/* PAGINATION */}
          <PaginationControl
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredTables.length}
            itemsPerPage={limit}
            itemName="bàn"
          />
        </TabsContent>
      </Tabs>

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        table={selectedTable}
        areas={areas}
        initialAreaId={selectedAreaId}
        onSuccess={fetchData}
      />

      {/* <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        table={tableToReserve}
        onSuccess={fetchData}
      /> */}

      <AreaModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        area={selectedArea}
        onSuccess={fetchData}
      />

      {/* Delete Table Alert */}
      <AlertDialog
        open={deleteTableConfirmOpen}
        onOpenChange={setDeleteTableConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bàn{" "}
              <strong>{tableToDelete?.code}</strong> ({tableToDelete?.area_name}
              )? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTableConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Area Alert */}
      <AlertDialog
        open={deleteAreaConfirmOpen}
        onOpenChange={setDeleteAreaConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khu vực</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khu vực{" "}
              <strong>{areaToDelete?.name}</strong>? Hành động này không thể
              hoàn tác. Các bàn trong khu vực này có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAreaConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Modal */}
      <Dialog open={!!qrModalTable} onOpenChange={() => setQrModalTable(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>QR Code bàn {qrModalTable?.code}</DialogTitle>
          </DialogHeader>
          {qrModalTable?.qrUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={qrModalTable.qrUrl}
                alt="QR Code"
                className="w-60 h-60 border rounded-lg bg-white"
              />
              <Button onClick={handlePrintQr} className="w-full">
                In QR
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Không có QR code
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
