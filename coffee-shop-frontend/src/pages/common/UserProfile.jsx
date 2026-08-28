import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, MapPin, Plus, Trash2, Loader2, Lock, Navigation, Home, Star, BriefcaseBusiness } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import { toast } from 'sonner';
import authenticationService from '../../services/authenticationService';
import userService from '../../services/userService';

import receiptSettingService from '../../services/receiptSettingService';
import { APP_ROUTES, STORAGE_KEYS } from '../../constants';
import VietmapAddressAutocomplete from '../../components/order/VietmapAddressAutocomplete';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const getStoredValue = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

const normalizePhoneInput = (value) => String(value || '').trim().replace(/\s+/g, '');

const isValidPhoneNumber = (value) => {
  const phone = normalizePhoneInput(value);

  if (phone.startsWith('+84')) {
    return /^\d{9,10}$/.test(phone.slice(3));
  }

  return /^\d{10,11}$/.test(phone);
};

export function UserProfile() {
  useDocumentTitle('Hồ sơ của tôi');
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const [addressForm, setAddressForm] = useState({
    receiver_name: '',
    receiver_phone: '',
    address: '',
    address_detail: '',
    address_type: 'home',
    latitude: null,
    longitude: null,
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [addressFieldErrors, setAddressFieldErrors] = useState({});



  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const response = await authenticationService.getProfile();
        if (!response?.success) {
          throw new Error(response?.message || 'Không thể tải profile');
        }

        if (isMounted) {
          setProfile(response.data || null);
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể tải profile';
        if (isMounted) {
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const getProfilePhoneError = (value) => {
    const normalizedPhone = normalizePhoneInput(value);

    if (!normalizedPhone) {
      return 'Số điện thoại không được để trống';
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      return 'Số điện thoại phải có 10-11 chữ số hoặc bắt đầu bằng +84';
    }

    return '';
  };

  const getReceiverPhoneError = (value) => {
    const normalizedReceiverPhone = normalizePhoneInput(value);

    if (!normalizedReceiverPhone) {
      return '';
    }

    if (!isValidPhoneNumber(normalizedReceiverPhone)) {
      return 'Số điện thoại người nhận phải có 10-11 chữ số hoặc bắt đầu bằng +84';
    }

    return '';
  };

  const displayName = useMemo(() => {
    if (!profile) return '';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || profile.username || profile.email || '';
  }, [profile]);

  const roleLabel = useMemo(() => {
    if (!profile) return '';
    return profile.role_name || profile.role || 'staff';
  }, [profile]);

  const isGoogleLogin = useMemo(
    () => getStoredValue(STORAGE_KEYS.AUTH_PROVIDER) === 'google',
    [],
  );

  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem("cached_store_name") || "Coffee Shop";
  });

  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const res = await receiptSettingService.getActive();
        const data = res?.data || null;
        if (data && data.store_name) {
          setStoreName(data.store_name);
          localStorage.setItem("cached_store_name", data.store_name);
        }
      } catch {
        // Fallback or ignore
      }
    };
    fetchStoreName();

    const handleReceiptUpdate = () => fetchStoreName();
    window.addEventListener("receiptSettingsUpdated", handleReceiptUpdate);
    return () => window.removeEventListener("receiptSettingsUpdated", handleReceiptUpdate);
  }, []);

  const handleSave = async () => {
    const normalizedPhone = normalizePhoneInput(profile?.phone);
    const phoneError = getProfilePhoneError(normalizedPhone);

    if (phoneError) {
      setProfileFieldErrors((prev) => ({ ...prev, phone: phoneError }));
      toast.error(phoneError);
      return;
    }

    setProfileFieldErrors((prev) => ({ ...prev, phone: '' }));

    setIsSaving(true);
    try {
      // Only send editable fields
      const updateData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: normalizedPhone,
      };

      const response = await userService.updateProfile(updateData);

      if (!response?.success) {
        throw new Error(response?.message || 'Không thể cập nhật profile');
      }

      setProfile((prev) => ({
        ...prev,
        ...response.data,
      }));
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isCustomer = profile?.role_id === 4;

  const getApiErrorMessage = (error, fallbackMessage) => {
    const validationErrors = error?.response?.data?.errors;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.map((item) => item?.message).filter(Boolean).join('\n');
    }

    return error?.response?.data?.message || error?.message || fallbackMessage;
  };

  const loadAddresses = useCallback(async () => {
    if (!isCustomer || !profile?.id) {
      setAddresses([]);
      return;
    }

    setIsAddressLoading(true);
    try {
      const response = await userService.getMyAddresses();
      if (!response?.success) {
        throw new Error(response?.message || 'Không thể tải danh sách địa chỉ');
      }

      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải danh sách địa chỉ'));
    } finally {
      setIsAddressLoading(false);
    }
  }, [isCustomer, profile?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);





  const resetAddressForm = () => {
    setAddressForm({
      receiver_name: '',
      receiver_phone: '',
      address: '',
      address_detail: '',
      address_type: 'home',
      latitude: null,
      longitude: null,
    });
    setAddressFieldErrors({});
    setEditingAddressId(null);
  };

  const openCreateAddressDialog = () => {
    resetAddressForm();
    setAddressDialogOpen(true);
  };

  const validateAddressForm = () => {
    const errors = {};
    const normalizedAddress = String(addressForm.address || '').trim();
    const detailAddress = String(addressForm.address_detail || '').trim();
    const receiverPhoneError = getReceiverPhoneError(addressForm.receiver_phone);

    if (!normalizedAddress) {
      errors.address = 'Vui lòng nhập địa chỉ nhận hàng';
    }

    if (!detailAddress) {
      errors.address_detail = 'Vui lòng nhập chi tiết số nhà, ngõ ngách';
    }

    if (receiverPhoneError) {
      errors.receiver_phone = receiverPhoneError;
    }

    setAddressFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmitAddress = async () => {
    if (!validateAddressForm()) return;
    const normalizedAddress = String(addressForm.address || '').trim();
    const detailAddress = String(addressForm.address_detail || '').trim();

    const normalizedReceiverPhone = normalizePhoneInput(addressForm.receiver_phone);

    const payload = {
      receiver_name: addressForm.receiver_name.trim() || null,
      receiver_phone: normalizedReceiverPhone || null,
      address: normalizedAddress,
      address_detail: detailAddress || null,
      address_type: addressForm.address_type,
      latitude: addressForm.latitude,
      longitude: addressForm.longitude,
    };

    setIsAddressSaving(true);
    try {
      if (editingAddressId) {
        const response = await userService.updateAddress(editingAddressId, payload);

        if (!response?.success) {
          throw new Error(response?.message || 'Không thể cập nhật địa chỉ');
        }

        toast.success('Đã cập nhật địa chỉ');
      } else {
        const response = await userService.createAddress(payload);

        if (!response?.success) {
          throw new Error(response?.message || 'Không thể thêm địa chỉ');
        }

        toast.success('Đã thêm địa chỉ mới');
      }

      resetAddressForm();
      setAddressDialogOpen(false);
      await loadAddresses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể lưu địa chỉ'));
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleEditAddress = (item) => {
    setEditingAddressId(item.id);
    setAddressFieldErrors({});
    setAddressForm({
      receiver_name: item.receiver_name || '',
      receiver_phone: item.receiver_phone || '',
      address: item.address || '',
      address_detail: item.address_detail || '',
      address_type: item.address_type || 'home',
      latitude: item.latitude || null,
      longitude: item.longitude || null,
    });
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = (id) => {
    setAddressToDelete(id);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsAddressSaving(true);
    try {
      const response = await userService.deleteAddress(addressToDelete);

      if (!response?.success) {
        throw new Error(response?.message || 'Không thể xóa địa chỉ');
      }

      if (editingAddressId === addressToDelete) {
        resetAddressForm();
      }

      toast.success('Đã xóa địa chỉ');
      await loadAddresses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể xóa địa chỉ'));
    } finally {
      setIsAddressSaving(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    setIsAddressSaving(true);
    try {
      const response = await userService.setDefaultAddress(id);

      if (!response?.success) {
        throw new Error(response?.message || 'Không thể đặt địa chỉ mặc định');
      }

      toast.success('Đã đặt làm địa chỉ mặc định');
      await loadAddresses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể đặt địa chỉ mặc định'));
    } finally {
      setIsAddressSaving(false);
    }
  };

  const getAddressTypeIconLabel = (type) => {
    if (type === 'work') return { label: 'Văn phòng', icon: <BriefcaseBusiness className="w-3.5 h-3.5" /> };
    if (type === 'other') return { label: 'Khác', icon: <Navigation className="w-3.5 h-3.5" /> };
    return { label: 'Nhà riêng', icon: <Home className="w-3.5 h-3.5" /> };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-16 mb-8">

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">Đang tải hồ sơ của bạn...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Hero ── */}
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 p-8 md:p-12 mb-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-background shadow-xl rounded-full">
                    <AvatarFallback className="text-3xl font-bold bg-accent/10 text-accent">
                      {displayName.split(' ').filter(Boolean).map((n) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isCustomer && (
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-accent rounded-full border-2 border-background flex items-center justify-center text-accent-foreground shadow-sm" title="Khách hàng">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}
                </div>
                {/* Name + role */}
                <div className="text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-3 border border-accent/20">
                    <User className="w-3 h-3" />
                    {roleLabel}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground leading-tight">
                    {displayName || 'Tài khoản của tôi'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
                </div>
                {/* Edit / Save buttons */}
                <div className="shrink-0">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setProfileFieldErrors({}); setIsEditing(true); }}
                      className="rounded-xl border-accent/30 text-accent hover:bg-accent/5 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setProfileFieldErrors({}); setIsEditing(false); }}
                        disabled={isSaving}
                        className="rounded-xl cursor-pointer"
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm cursor-pointer"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* ── Left: Account info ── */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Profile fields */}
                <div className="rounded-2xl bg-card border border-border/50 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-accent rounded-full" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Thông tin cá nhân</p>
                  </div>

                  <div className="space-y-5">
                    {/* Read-only */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên đăng nhập</Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                          <Input
                            id="username"
                            value={profile?.username || ''}
                            disabled
                            className="pl-10 rounded-xl bg-secondary/40 border-transparent text-muted-foreground cursor-not-allowed"
                          />
                          <Lock className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/30" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                          <Input
                            id="email"
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className="pl-10 rounded-xl bg-secondary/40 border-transparent text-muted-foreground cursor-not-allowed"
                          />
                          <Lock className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/30" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Editable */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Họ</Label>
                        <div className="relative">
                          <User className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isEditing ? 'text-accent' : 'text-muted-foreground/50'}`} />
                          <Input
                            id="first_name"
                            value={profile?.first_name || ''}
                            disabled={!isEditing}
                            className={`pl-10 rounded-xl transition-all ${isEditing ? 'bg-background border-border focus-visible:ring-accent/40 focus-visible:border-accent' : 'bg-transparent border-transparent font-semibold text-foreground shadow-none'}`}
                            onChange={(e) => setProfile((prev) => ({ ...prev, first_name: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên</Label>
                        <div className="relative">
                          <User className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isEditing ? 'text-accent' : 'text-muted-foreground/50'}`} />
                          <Input
                            id="last_name"
                            value={profile?.last_name || ''}
                            disabled={!isEditing}
                            className={`pl-10 rounded-xl transition-all ${isEditing ? 'bg-background border-border focus-visible:ring-accent/40 focus-visible:border-accent' : 'bg-transparent border-transparent font-semibold text-foreground shadow-none'}`}
                            onChange={(e) => setProfile((prev) => ({ ...prev, last_name: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số điện thoại</Label>
                        <div className="relative">
                          <Phone className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isEditing ? 'text-accent' : 'text-muted-foreground/50'}`} />
                          <Input
                            id="phone"
                            type="tel"
                            value={profile?.phone || ''}
                            disabled={!isEditing}
                            className={`pl-10 rounded-xl transition-all ${isEditing ? `bg-background ${profileFieldErrors.phone ? 'border-destructive focus-visible:ring-destructive/40' : 'border-border focus-visible:ring-accent/40 focus-visible:border-accent'}` : 'bg-transparent border-transparent font-semibold text-foreground shadow-none'}`}
                            onChange={(e) => {
                              const value = e.target.value;
                              setProfile((prev) => ({ ...prev, phone: value }));
                              setProfileFieldErrors((prev) => ({ ...prev, phone: getProfilePhoneError(value) }));
                            }}
                          />
                        </div>
                        {isEditing && profileFieldErrors.phone && (
                          <p className="text-xs text-destructive ml-1">{profileFieldErrors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses (customer only) */}
                {isCustomer && (
                  <div className="rounded-2xl bg-card border border-border/50 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-accent rounded-full" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Địa chỉ giao hàng</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={openCreateAddressDialog}
                        disabled={isAddressSaving}
                        className="rounded-xl bg-accent/10 text-accent hover:bg-accent/20 border-0 shadow-none font-semibold cursor-pointer"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Thêm địa chỉ
                      </Button>
                    </div>

                    {isAddressLoading ? (
                      <div className="flex flex-col items-center justify-center p-10 rounded-xl border border-dashed border-border">
                        <Loader2 className="w-6 h-6 animate-spin text-accent mb-2" />
                        <p className="text-sm text-muted-foreground">Đang tải...</p>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border text-center">
                        <MapPin className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">Bạn chưa có địa chỉ nào</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Hãy thêm địa chỉ để tiện lợi khi đặt hàng!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses.map((item) => {
                          const typeInfo = getAddressTypeIconLabel(item.address_type);
                          const isDefault = Number(item.is_default) === 1;
                          return (
                            <div
                              key={item.id}
                              className={`relative group flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${isDefault ? 'border-accent/40 bg-accent/5' : 'border-border/50 bg-card hover:border-accent/20'}`}
                            >
                              {isDefault && (
                                <span className="absolute top-3 right-3 text-[10px] font-bold bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full">
                                  Mặc định
                                </span>
                              )}

                              <div className="flex items-center gap-3 pr-20">
                                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                  {typeInfo.icon}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-foreground">{item.receiver_name || 'Không tên'}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{item.receiver_phone || 'Thiếu SĐT'}</p>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.address}</p>

                              <div className="flex items-center gap-1 pt-2 border-t border-border/40">
                                <Button
                                  type="button" size="sm" variant="ghost"
                                  className="h-7 rounded-lg text-xs px-2 hover:text-accent hover:bg-accent/5 cursor-pointer"
                                  onClick={() => handleEditAddress(item)}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" /> Sửa
                                </Button>
                                <Button
                                  type="button" size="sm" variant="ghost"
                                  className="h-7 rounded-lg text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/5 cursor-pointer"
                                  disabled={isAddressSaving}
                                  onClick={() => handleDeleteAddress(item.id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> Xóa
                                </Button>
                                <div className="flex-1" />
                                {!isDefault && (
                                  <Button
                                    type="button" size="sm" variant="outline"
                                    className="h-7 rounded-lg text-[11px] font-semibold border-accent/30 text-accent hover:bg-accent/5 cursor-pointer"
                                    disabled={isAddressSaving}
                                    onClick={() => handleSetDefaultAddress(item.id)}
                                  >
                                    Đặt mặc định
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Right: Account settings sidebar ── */}
              <div className="lg:col-span-1 flex flex-col gap-4">

                {/* Security */}
                <div className="rounded-2xl bg-card border border-border/50 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-accent rounded-full" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Cài đặt</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/40 hover:border-accent/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Bảo mật</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isGoogleLogin ? 'Đăng nhập Google' : 'Mật khẩu & Đăng nhập'}
                        </p>
                      </div>
                    </div>
                    {!isGoogleLogin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-border text-xs cursor-pointer"
                        onClick={() => navigate(APP_ROUTES.CHANGE_PASSWORD)}
                      >
                        Đổi mật khẩu
                      </Button>
                    )}
                  </div>
                </div>

                {/* Store member widget */}
                <div className="rounded-2xl bg-card border border-border/60 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-4">
                    <Star className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground font-serif mb-1">Thành viên {storeName}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quản lý thông tin cá nhân, địa chỉ giao hàng và cài đặt tài khoản ngay tại đây.
                  </p>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* ── Address Dialog ── */}
      <Dialog
        open={addressDialogOpen}
        onOpenChange={(open) => {
          setAddressDialogOpen(open);
          if (!open && !isAddressSaving) resetAddressForm();
        }}
      >
        <DialogContent className="sm:max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Nhập thông tin nhận hàng để đội ngũ giao hàng có thể tiếp cận bạn nhanh nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="receiver_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên người nhận</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
                  <Input
                    id="receiver_name"
                    value={addressForm.receiver_name}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, receiver_name: e.target.value }))}
                    placeholder="VD: Anh Tùng"
                    className="pl-9 h-11 rounded-xl focus-visible:ring-accent/40 focus-visible:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiver_phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số điện thoại</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
                  <Input
                    id="receiver_phone"
                    value={addressForm.receiver_phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddressForm((prev) => ({ ...prev, receiver_phone: value }));
                      setAddressFieldErrors((prev) => ({ ...prev, receiver_phone: getReceiverPhoneError(value) }));
                    }}
                    placeholder="09xx..."
                    className={`pl-9 h-11 rounded-xl ${addressFieldErrors.receiver_phone ? 'border-destructive focus-visible:ring-destructive/40' : 'focus-visible:ring-accent/40 focus-visible:border-accent'}`}
                  />
                </div>
                {addressFieldErrors.receiver_phone && (
                  <p className="text-xs text-destructive ml-1">{addressFieldErrors.receiver_phone}</p>
                )}
              </div>
            </div>

            {/* Address type selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loại địa chỉ</Label>
              <div className="flex gap-2">
                {[
                  { value: 'home', label: 'Nhà riêng', icon: Home },
                  { value: 'work', label: 'Văn phòng', icon: BriefcaseBusiness },
                  { value: 'other', label: 'Khác', icon: Navigation }
                ].map(type => {
                  const Icon = type.icon;
                  const isActive = addressForm.address_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setAddressForm((prev) => ({ ...prev, address_type: type.value }))}
                      className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive
                        ? 'bg-accent/10 text-accent ring-2 ring-accent/40'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary border border-border'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map autocomplete */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <VietmapAddressAutocomplete
                  initialAddress={addressForm.address}
                  error={addressFieldErrors.address}
                  hideGPSButton={true}
                  onAddressSelect={({ address, latitude, longitude }) => {
                    setAddressForm((prev) => ({ ...prev, address, latitude, longitude }));
                    setAddressFieldErrors((prev) => ({ ...prev, address: address.trim() ? '' : prev.address }));
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address_detail" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Chi tiết số nhà, ngõ ngách <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address_detail"
                  value={addressForm.address_detail}
                  onChange={(e) => {
                    setAddressForm((prev) => ({ ...prev, address_detail: e.target.value }));
                    setAddressFieldErrors(prev => ({ ...prev, address_detail: e.target.value.trim() ? '' : prev.address_detail }));
                  }}
                  placeholder="VD: Số nhà 10, Ngõ 20..."
                  className={`h-11 rounded-xl ${addressFieldErrors.address_detail ? 'border-destructive focus-visible:ring-destructive/40' : 'focus-visible:ring-accent/40 focus-visible:border-accent'}`}
                />
                {addressFieldErrors.address_detail && (
                  <p className="text-xs text-destructive ml-1">{addressFieldErrors.address_detail}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button" variant="ghost"
                onClick={() => { setAddressDialogOpen(false); resetAddressForm(); }}
                disabled={isAddressSaving}
                className="rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={handleSubmitAddress}
                disabled={isAddressSaving}
                className="rounded-xl px-6 font-bold shadow-sm bg-accent hover:bg-accent/90 text-accent-foreground cursor-pointer"
              >
                {isAddressSaving ? 'Đang xử lý...' : editingAddressId ? 'Lưu thay đổi' : 'Hoàn tất thêm mới'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!addressToDelete} onOpenChange={(open) => !open && setAddressToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5 flex-shrink-0" />
              Xóa địa chỉ
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setAddressToDelete(null)}
              disabled={isAddressSaving}
              className="rounded-xl cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDeleteAddress}
              disabled={isAddressSaving}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {isAddressSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
