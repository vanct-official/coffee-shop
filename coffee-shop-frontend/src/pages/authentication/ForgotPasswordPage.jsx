import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, CheckCircle2, AlertCircle, Shield, Eye, EyeOff, Coffee, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_ROUTES } from "@/constants";
import authenticationService from "@/services/authenticationService";
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

const StepHeader = ({ current, number, title, isCompleted }) => {
	const isActive = current === number;

	return (
		<div className={`flex items-center gap-3 transition-opacity duration-300 ${!isActive && !isCompleted ? 'opacity-40' : 'opacity-100'}`}>
			{isCompleted ? (
				<div className="h-8 w-8 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 animate-in zoom-in">
					<CheckCircle2 className="h-5 w-5" />
				</div>
			) : (
				<div
					className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
						isActive 
							? "border-accent bg-accent text-accent-foreground shadow-sm" 
							: "border-border bg-transparent text-muted-foreground"
					}`}
				>
					{number}
				</div>
			)}
			<span className={`font-semibold ${isActive ? "text-foreground" : isCompleted ? "text-muted-foreground line-through decoration-border" : "text-muted-foreground"}`}>
				{title}
			</span>
		</div>
	);
};

export default function ForgotPasswordPage() {
	const navigate = useNavigate();

	// Step states
	const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
	const [completedSteps, setCompletedSteps] = useState({
		1: false,
		2: false,
	});

	// Form states
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Error & loading states
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userEmail, setUserEmail] = useState("");

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;

		setErrorMessage("");

		if (!email.trim()) {
			setErrorMessage("Vui lòng nhập email");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await authenticationService.resetPassword(email);

			if (!response?.success) {
				throw new Error(response?.message || "Không thể gửi mã reset");
			}

			setUserEmail(email);
			setCompletedSteps((prev) => ({ ...prev, 1: true }));
			setCurrentStep(2);
			toast.success("Mã xác thực đã được gửi đến email của bạn");
		} catch (error) {
			const message = error?.response?.data?.message || error?.message || "Không thể gửi mã reset";
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOtpSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;

		setErrorMessage("");

		if (!otp.trim()) {
			setErrorMessage("Vui lòng nhập mã OTP");
			return;
		}

		if (otp.length !== 8) {
			setErrorMessage("Mã OTP phải là 8 chữ số");
			return;
		}

		setIsSubmitting(true);

		try {
			const verifyResponse = await authenticationService.verifyForgotPasswordOtp(userEmail, otp);

			if (!verifyResponse?.success) {
				throw new Error(verifyResponse?.message || "Mã OTP không hợp lệ");
			}

			setCompletedSteps((prev) => ({ ...prev, 2: true }));
			setCurrentStep(3);
			toast.success("Xác thực OTP thành công");
		} catch (error) {
			const message = error?.response?.data?.message || error?.message || "Mã OTP không hợp lệ";
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		if (isSubmitting) return;

		setErrorMessage("");

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
			const response = await authenticationService.resetPasswordWithOtp({
				email: userEmail,
				otp,
				newPassword,
				confirmPassword,
			});

			if (!response?.success) {
				throw new Error(response?.message || "Không thể đặt lại mật khẩu");
			}

			toast.success("Đặt lại mật khẩu thành công! Đang chuyển hướng...");

			setTimeout(() => {
				navigate(APP_ROUTES.LOGIN, { replace: true });
			}, 2000);
		} catch (error) {
			const message = error?.response?.data?.message || error?.message || "Không thể đặt lại mật khẩu";
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePasswordChange = (value) => {
		setNewPassword(value);
		setPasswordStrength(calculatePasswordStrength(value));
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="relative min-h-screen overflow-hidden">
				{/* Hiệu ứng Glow nền */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/15 blur-[100px]" />
					<div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
				</div>

				<button 
					onClick={() => navigate('/')} 
					className="absolute top-6 left-6 z-50 flex items-center justify-center p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all hover:scale-105 hover:shadow-lg"
					title="Quay lại trang chủ"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				
				<div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
					<div className="hidden lg:flex relative items-center justify-center overflow-hidden p-10 animate-in fade-in duration-1000">
						<div className="absolute inset-0">
							<img 
								src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1920&q=80" 
								alt="Coffee Shop Background" 
								className="h-full w-full object-cover transition-transform duration-[15s] hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px]" />
						</div>
						
						<div className="relative z-10 max-w-md space-y-6">
							<div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-sm text-white shadow-lg">
								<Shield className="h-4 w-4 text-accent animate-pulse" />
								<span className="font-medium tracking-wide font-sans">Khôi phục tài khoản</span>
							</div>
							<div className="space-y-4">
								<h1 className="text-4xl font-bold font-serif text-white lg:text-5xl leading-tight drop-shadow-md">
									Đừng lo lắng!
								</h1>
								<p className="text-base font-medium text-gray-200 drop-shadow-sm leading-relaxed font-sans">
									Bạn lỡ quên mật khẩu? Hãy làm theo các bước bên phải để khôi phục tài khoản dễ dàng và an toàn.
								</p>
							</div>
							<div className="grid gap-4 text-sm text-gray-200 mt-8">
								{[
									"Bảo mật thông tin chặt chẽ qua Email OTP",
									"Thiết lập lại mật khẩu an toàn, nhanh chóng",
									"Lấy lại quyền truy cập chỉ trong 2 phút"
								].map((text, idx) => (
									<div key={idx} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-3.5 shadow-sm transition-all hover:bg-white/10">
										<div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
											<span className="h-2 w-2 rounded-full bg-accent" />
										</div>
										<span className="font-medium font-sans">{text}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
						<div className="w-full max-w-[480px] rounded-2xl border border-border bg-card/85 backdrop-blur-2xl p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-[0.98] duration-700">
							<div className="mb-10 flex flex-col items-center space-y-3 text-center animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
								<div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
									<Lock className="w-8 h-8 text-accent" />
								</div>
								<h1 className="text-xl font-bold font-serif text-foreground">Đặt lại mật khẩu</h1>
								<p className="text-sm font-medium text-muted-foreground">Hoàn thành 3 bước đơn giản dưới đây</p>
							</div>

							{/* Progress Steps */}
							<div className="mb-10 space-y-5 px-2 animate-in fade-in zoom-in duration-500" style={{ animationDelay: '200ms' }}>
								<StepHeader current={currentStep} number={1} title="Xác nhận Email" isCompleted={completedSteps[1]} />
								<div className={`w-0.5 h-6 ml-[15px] rounded-full transition-colors ${completedSteps[1] ? 'bg-accent/50' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
								<StepHeader current={currentStep} number={2} title="Xác thực Mã OTP" isCompleted={completedSteps[2]} />
								<div className={`w-0.5 h-6 ml-[15px] rounded-full transition-colors ${completedSteps[2] ? 'bg-accent/50' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
								<StepHeader current={currentStep} number={3} title="Đặt Mật khẩu Mới" isCompleted={false} />
							</div>

							<div className="animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '300ms' }}>
								{/* Step 1: Email */}
								{currentStep === 1 && (
									<form className="space-y-6" onSubmit={handleEmailSubmit}>
										<div className="space-y-3">
											<Label htmlFor="email" className="text-foreground font-semibold ml-1">Email đã đăng ký</Label>
											<div className="relative group">
												<Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
												<Input
													id="email"
													type="email"
													placeholder="you@example.com"
													className="pl-11 h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all font-medium text-foreground"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													autoFocus
												/>
											</div>

											{errorMessage && (
												<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium flex items-start gap-2.5 shadow-sm animate-in zoom-in">
													<AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
													<span>{errorMessage}</span>
												</div>
											)}
										</div>

										<Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold text-primary-foreground shadow-md bg-primary hover:bg-accent active:translate-y-0 transition-all hover:-translate-y-0.5 hover:shadow-accent/20" disabled={isSubmitting}>
											{isSubmitting ? "Đang gửi..." : "Gửi mã xác thực"}
										</Button>
									</form>
								)}

								{/* Step 2: OTP */}
								{currentStep === 2 && (
									<form className="space-y-6 animate-in slide-in-from-right-4 zoom-in-95 duration-300" onSubmit={handleOtpSubmit}>
										<div className="space-y-4">
											<div className="bg-secondary border border-border rounded-xl p-4 text-sm text-foreground">
												Mã OTP đã được gửi đến <strong>{userEmail}</strong>
											</div>

											<div className="space-y-3">
												<Label htmlFor="otp" className="text-foreground font-semibold ml-1">Mã OTP (8 chữ số)</Label>
												<div className="relative group">
													<Shield className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
													<Input
														id="otp"
														type="text"
														placeholder="--------"
														maxLength={8}
														className="pl-12 h-14 rounded-xl text-center text-2xl tracking-[0.4em] font-mono bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all text-foreground"
														value={otp}
														onChange={(e) => {
															const value = e.target.value.replace(/\D/g, "");
															setOtp(value);
														}}
														autoFocus
													/>
												</div>
											</div>

											{errorMessage && (
												<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium flex items-start gap-2.5 shadow-sm animate-in zoom-in">
													<AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
													<span>{errorMessage}</span>
												</div>
											)}
										</div>

										<Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold text-primary-foreground shadow-md bg-primary hover:bg-accent transition-all hover:-translate-y-0.5" disabled={isSubmitting || otp.length !== 8}>
											{isSubmitting ? "Đang xác thực..." : "Xác thực OTP"}
										</Button>
									</form>
								)}

								{/* Step 3: New Password */}
								{currentStep === 3 && (
									<form className="space-y-6 animate-in slide-in-from-right-4 zoom-in-95 duration-300" onSubmit={handlePasswordSubmit}>
										<div className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="newPassword" className="text-foreground font-semibold ml-1">Mật khẩu mới</Label>
												<div className="relative group">
													<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
													<Input
														id="newPassword"
														type={showNewPassword ? "text" : "password"}
														placeholder="••••••••"
														className="pl-11 pr-12 h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all font-medium text-foreground"
														value={newPassword}
														onChange={(e) => handlePasswordChange(e.target.value)}
														autoFocus
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
														<div className="text-[11px] text-muted-foreground space-y-1 mt-2">
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
																{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword) ? "✓" : "○"} Ký tự đặc biệt
															</p>
															<p className={newPassword.length >= 8 && newPassword.length <= 20 ? "text-emerald-600 dark:text-emerald-500 font-medium" : ""}>
																{newPassword.length >= 8 && newPassword.length <= 20 ? "✓" : "○"} Độ dài 8-20 ký tự
															</p>
														</div>
													</div>
												)}
											</div>

											<div className="space-y-2">
												<Label htmlFor="confirmPassword" className="text-foreground font-semibold ml-1">Xác nhận mật khẩu mới</Label>
												<div className="relative group">
													<Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
													<Input
														id="confirmPassword"
														type={showConfirmPassword ? "text" : "password"}
														placeholder="••••••••"
														className="pl-11 pr-12 h-12 rounded-xl bg-card border-border focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-all font-medium text-foreground"
														value={confirmPassword}
														onChange={(e) => setConfirmPassword(e.target.value)}
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

											{errorMessage && (
												<div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium flex items-start gap-2.5 shadow-sm animate-in zoom-in">
													<AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
													<span>{errorMessage}</span>
												</div>
											)}
										</div>

										<Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold text-primary-foreground shadow-md bg-primary hover:bg-accent transition-all hover:-translate-y-0.5" disabled={isSubmitting}>
											{isSubmitting ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
										</Button>
									</form>
								)}
							</div>

							<div className="mt-8 text-center text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '400ms' }}>
								Bạn nhớ mật khẩu rồi?{" "}
								<button
									type="button"
									className="text-accent font-semibold hover:underline ml-1"
									onClick={() => navigate(APP_ROUTES.LOGIN)}
								>
									Đăng nhập ngay
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
