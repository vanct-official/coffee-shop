import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authenticationService from "@/services/authenticationService";
import { STORAGE_KEYS } from "@/constants";
import { toast } from "sonner";

const calculatePasswordStrength = (pwd) => {
	const hasLower = /[a-z]/.test(pwd);
	const hasUpper = /[A-Z]/.test(pwd);
	const hasNumber = /[0-9]/.test(pwd);
	const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pwd);
	const lengthValid = pwd.length >= 8 && pwd.length <= 20;

	let strength = 0;
	if (hasLower) strength += 1;
	if (hasUpper) strength += 1;
	if (hasNumber) strength += 1;
	if (hasSpecial) strength += 1;
	if (lengthValid) strength += 1;

	return Math.min(strength, 4);
};

const getPasswordStrengthLabel = (strength) => {
	const labels = ["", "Yếu", "Trung bình", "Khá mạnh", "Rất mạnh"];
	return labels[strength];
};

const getPasswordStrengthColor = (strength) => {
	const colors = ["", "bg-red-500", "bg-yellow-500", "bg-amber-500", "bg-green-500"];
	return colors[strength];
};

export default function ChangePasswordPage() {
	const navigate = useNavigate();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [capsLockActive, setCapsLockActive] = useState(false);

	useEffect(() => {
		const authProvider =
			localStorage.getItem(STORAGE_KEYS.AUTH_PROVIDER) ||
			sessionStorage.getItem(STORAGE_KEYS.AUTH_PROVIDER);

		if (authProvider === "google") {
			toast.error("Tài khoản Google không hỗ trợ đổi mật khẩu tại đây");
			navigate(-1);
			return;
		}

		const handleGlobalKeyDown = (e) => {
			if (e.getModifierState && e.getModifierState("CapsLock")) {
				setCapsLockActive(true);
			} else {
				setCapsLockActive(false);
			}
		};
		window.addEventListener("keydown", handleGlobalKeyDown);
		window.addEventListener("keyup", handleGlobalKeyDown);
		return () => {
			window.removeEventListener("keydown", handleGlobalKeyDown);
			window.removeEventListener("keyup", handleGlobalKeyDown);
		};
	}, [navigate]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (isSubmitting) return;

		setErrorMessage("");

		if (!currentPassword) {
			setErrorMessage("Vui lòng nhập mật khẩu hiện tại");
			return;
		}

		if (!newPassword) {
			setErrorMessage("Vui lòng nhập mật khẩu mới");
			return;
		}

		if (newPassword !== confirmPassword) {
			setErrorMessage("Mật khẩu xác nhận không khớp");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await authenticationService.changePassword({
				oldPassword: currentPassword,
				newPassword,
				confirmPassword,
			});

			if (!response?.success) {
				throw new Error(response?.message || "Đổi mật khẩu thất bại");
			}

			toast.success("Đổi mật khẩu thành công");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			navigate(-1);
		} catch (error) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				"Đổi mật khẩu thất bại";
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-background relative overflow-hidden">
			{/* Glow Background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[100px]" />
				<div className="absolute right-1/4 bottom-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
			</div>

			<div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-12 relative z-10 w-full">
				<div className="w-full rounded-2xl border border-border bg-card/85 backdrop-blur-2xl p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-[0.98] duration-700">
					
					<div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="self-start flex items-center justify-center w-10 h-10 bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-all hover:scale-105 shadow-sm border border-border absolute top-6 left-6"
							title="Quay lại"
						>
							<ArrowLeft className="w-5 h-5" />
						</button>
						<div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
							<Lock className="w-8 h-8 text-accent" />
						</div>
						<h1 className="text-xl font-bold font-serif text-foreground">
							Thay đổi mật khẩu
						</h1>
						<p className="text-sm font-medium text-muted-foreground mt-2">
							Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
						</p>
					</div>

					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Current Password */}
						<div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
							<Label htmlFor="currentPassword" className="text-foreground font-semibold ml-1">Mật khẩu hiện tại</Label>
							<div className="relative group">
								<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
								<Input
									id="currentPassword"
									type={showCurrentPassword ? "text" : "password"}
									placeholder="Nhập mật khẩu hiện tại"
									className="pl-11 pr-12 h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all font-medium text-foreground"
									autoComplete="current-password"
									value={currentPassword}
									onChange={(event) => setCurrentPassword(event.target.value)}
									autoFocus
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
								>
									{showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
							
							{capsLockActive && (
								<div className="flex items-center gap-1.5 mt-1.5 ml-1 text-accent text-xs font-semibold animate-in fade-in zoom-in">
									<AlertTriangle className="w-3.5 h-3.5" />
									<span>Caps Lock đang bật</span>
								</div>
							)}
						</div>

						{/* New Password */}
						<div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
							<Label htmlFor="newPassword" className="text-foreground font-semibold ml-1">Mật khẩu mới</Label>
							<div className="relative group">
								<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
								<Input
									id="newPassword"
									type={showNewPassword ? "text" : "password"}
									placeholder="Nhập mật khẩu mới"
									className="pl-11 pr-12 h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all font-medium text-foreground"
									autoComplete="new-password"
									value={newPassword}
									onChange={(event) => {
										const nextValue = event.target.value;
										setNewPassword(nextValue);
										setPasswordStrength(calculatePasswordStrength(nextValue));
									}}
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
								>
									{showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
							{newPassword && (
								<div className="space-y-2 mt-3 p-3 rounded-xl bg-secondary/50 border border-border">
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground font-semibold">Độ mạnh:</span>
										<span className={`font-bold ${
											passwordStrength === 1 ? "text-destructive" :
											passwordStrength === 2 ? "text-amber-500" :
											passwordStrength === 3 ? "text-primary" :
											passwordStrength === 4 ? "text-emerald-500" : ""
										}`}>
											{getPasswordStrengthLabel(passwordStrength)}
										</span>
									</div>
									<div className="h-1.5 flex gap-1 rounded-full overflow-hidden">
										{[1, 2, 3, 4].map((level) => (
											<div
												key={level}
												className={`flex-1 transition-all duration-300 rounded-full ${
													passwordStrength >= level
														? (passwordStrength === 1 ? "bg-destructive" : passwordStrength === 2 ? "bg-amber-500" : passwordStrength === 3 ? "bg-primary" : "bg-emerald-500")
														: "bg-gray-200 dark:bg-gray-700"
												}`}
											/>
										))}
									</div>
									<div className="space-y-1 text-[11px] text-muted-foreground mt-2">
										<p className={/[a-z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-500 font-medium" : ""}>
											{/[a-z]/.test(newPassword) ? "✓" : "○"} Chữ thường (a-z)
										</p>
										<p className={/[A-Z]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-500 font-medium" : ""}>
											{/[A-Z]/.test(newPassword) ? "✓" : "○"} Chữ hoa (A-Z)
										</p>
										<p className={/[0-9]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-500 font-medium" : ""}>
											{/[0-9]/.test(newPassword) ? "✓" : "○"} Số (0-9)
										</p>
										<p className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword) ? "text-emerald-600 dark:text-emerald-500 font-medium" : ""}>
											{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword) ? "✓" : "○"} Ký tự đặc biệt (!@#$...)
										</p>
										<p className={newPassword.length >= 8 && newPassword.length <= 20 ? "text-emerald-600 dark:text-emerald-500 font-medium" : ""}>
											{newPassword.length >= 8 && newPassword.length <= 20 ? "✓" : "○"} Độ dài 8-20 ký tự
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Confirm Password */}
						<div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '400ms' }}>
							<Label htmlFor="confirmPassword" className="text-foreground font-semibold ml-1">Xác nhận mật khẩu mới</Label>
							<div className="relative group">
								<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Nhập lại mật khẩu mới"
									className="pl-11 pr-12 h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all font-medium text-foreground"
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
								>
									{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
						</div>

						{errorMessage ? (
							<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium flex items-start gap-2.5 shadow-sm animate-in zoom-in">
								<AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
								<span>{errorMessage}</span>
							</div>
						) : null}

						<div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '500ms' }}>
							<Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold text-primary-foreground shadow-md bg-primary hover:bg-accent transition-all hover:-translate-y-0.5" disabled={isSubmitting}>
								{isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
