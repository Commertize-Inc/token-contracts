import React from "react";
import { User as UserIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { StepView, Input } from "@commertize/ui";

interface ProfileStepProps {
	profileData: {
		firstName: string;
		lastName: string;
		phoneNumber: string;
		bio: string;
		avatarUrl: string;
		username: string;
	};
	fieldErrors: Record<string, string>;
	usernameAvailable: boolean | null;
	isCheckingUsername: boolean;
	loading: boolean;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({
	profileData,
	fieldErrors,
	usernameAvailable,
	isCheckingUsername,
	loading,
	onChange,
	onSubmit,
}) => {
	return (
		<StepView
			title="Your Profile"
			description="Tell us a bit about yourself."
			icon={<UserIcon className="w-8 h-8 text-blue-600" />}
		>
			<form onSubmit={onSubmit} className="space-y-6">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
					<div className="p-1 bg-blue-100 rounded-full shrink-0">
						<CheckCircle className="w-4 h-4 text-blue-600" />
					</div>
					<div>
						<h3 className="text-sm font-medium text-blue-900">
							Verified Identity Data
						</h3>
						<p className="text-sm text-blue-700 mt-1">
							Your Name and Phone Number have been verified via Plaid and cannot
							be edited.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">
							First Name
						</label>
						<Input
							name="firstName"
							value={profileData.firstName}
							onChange={onChange}
							placeholder="Jane"
							required
							disabled
						/>
						{fieldErrors.firstName && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.firstName}
							</p>
						)}
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">
							Last Name
						</label>
						<Input
							name="lastName"
							value={profileData.lastName}
							onChange={onChange}
							placeholder="Doe"
							required
							disabled
						/>
						{fieldErrors.lastName && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.lastName}
							</p>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">
						Username
					</label>
					<div className="relative">
						<Input
							name="username"
							value={profileData.username}
							onChange={onChange}
							placeholder="janedoe"
							required
						/>
						{fieldErrors.username && (
							<p className="text-sm text-red-500 mt-1">
								{fieldErrors.username}
							</p>
						)}
						<div className="absolute right-3 top-[10px]">
							{isCheckingUsername ? (
								<Loader2 className="w-5 h-5 animate-spin text-slate-400" />
							) : profileData.username.length >= 3 ? (
								usernameAvailable ? (
									<CheckCircle className="w-5 h-5 text-green-500" />
								) : usernameAvailable === false ? (
									<XCircle className="w-5 h-5 text-red-500" />
								) : null
							) : null}
						</div>
					</div>
					{usernameAvailable && (
						<p className="mt-1 text-xs text-green-600">Username is available</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-slate-700 mb-1">
						Phone Number
					</label>
					<Input
						name="phoneNumber"
						value={profileData.phoneNumber}
						onChange={onChange}
						placeholder="+1 (555) 000-0000"
						type="tel"
						required
						disabled
					/>
					{fieldErrors.phoneNumber && (
						<p className="text-sm text-red-500 mt-1">
							{fieldErrors.phoneNumber}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-700">
						Bio (Optional)
					</label>
					<textarea
						name="bio"
						value={profileData.bio}
						onChange={onChange}
						rows={4}
						className="w-full px-4 py-2 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
						placeholder="Tell us about your investment goals..."
					/>
				</div>

				<div className="pt-4">
					<button
						type="submit"
						disabled={loading || usernameAvailable === false}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							"Continue"
						)}
					</button>
				</div>
			</form>
		</StepView>
	);
};
