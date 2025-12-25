import { useState } from "react";
import { Send, Mail, User, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@commertize/ui";

export default function ContactForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Construct mailto link
		const { name, email, subject, message } = formData;
		const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
		const mailtoLink = `mailto:support@commertize.com?subject=${encodeURIComponent(
			subject || "Contact from Landing Page"
		)}&reply-to=${encodeURIComponent(email)}&body=${encodeURIComponent(body)}`;

		// Open email client
		window.location.href = mailtoLink;

		// Reset state after a brief delay
		setTimeout(() => {
			setIsSubmitting(false);
			// Optional: Clear form or show specific success message if we were using a real backend
		}, 1000);
	};

	return (
		<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 overflow-hidden relative">
			{/* Decorative background elements */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A024]/5 rounded-bl-full pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4A024]/5 rounded-tr-full pointer-events-none" />

			<form onSubmit={handleSubmit} className="space-y-6 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label
							htmlFor="name"
							className="text-sm font-medium text-gray-700 flex items-center gap-2"
						>
							<User size={16} className="text-[#D4A024]" />
							Your Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							required
							value={formData.name}
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4A024] focus:ring-1 focus:ring-[#D4A024] outline-none transition-all bg-gray-50/50 focus:bg-white"
							placeholder="John Doe"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="email"
							className="text-sm font-medium text-gray-700 flex items-center gap-2"
						>
							<Mail size={16} className="text-[#D4A024]" />
							Email Address
						</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							value={formData.email}
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4A024] focus:ring-1 focus:ring-[#D4A024] outline-none transition-all bg-gray-50/50 focus:bg-white"
							placeholder="john@example.com"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="subject"
						className="text-sm font-medium text-gray-700 flex items-center gap-2"
					>
						<AlertCircle size={16} className="text-[#D4A024]" />
						Subject
					</label>
					<input
						type="text"
						id="subject"
						name="subject"
						required
						value={formData.subject}
						onChange={handleChange}
						className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4A024] focus:ring-1 focus:ring-[#D4A024] outline-none transition-all bg-gray-50/50 focus:bg-white"
						placeholder="Investment Inquiry"
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="message"
						className="text-sm font-medium text-gray-700 flex items-center gap-2"
					>
						<MessageSquare size={16} className="text-[#D4A024]" />
						Message
					</label>
					<textarea
						id="message"
						name="message"
						required
						rows={5}
						value={formData.message}
						onChange={handleChange}
						className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4A024] focus:ring-1 focus:ring-[#D4A024] outline-none transition-all bg-gray-50/50 focus:bg-white resize-none"
						placeholder="How can we help you?"
					/>
				</div>

				<Button
					type="submit"
					disabled={isSubmitting}
					className="w-full py-4 text-base font-medium bg-[#D4A024] hover:bg-[#B8860B] text-white rounded-xl shadow-lg shadow-[#D4A024]/20 transition-all hover:shadow-[#D4A024]/30"
				>
					<span className="flex items-center justify-center gap-2">
						{isSubmitting ? "Opening Email Client..." : "Send Message"}
						{!isSubmitting && <Send size={18} />}
					</span>
				</Button>

				<p className="text-center text-xs text-gray-400 mt-4">
					This will open your default email client to send the message to{" "}
					<a
						href="mailto:support@commertize.com"
						className="text-[#D4A024] hover:underline"
					>
						support@commertize.com
					</a>
				</p>
			</form>
		</div>
	);
}
