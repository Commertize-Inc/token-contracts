import { Building, Building2, Home, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAF9] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
			{/* Background Decorative Elements */}
			<div className="absolute inset-0 opacity-5 pointer-events-none">
				<div className="absolute top-20 left-10 transform -rotate-12">
					<Building2 size={300} strokeWidth={0.5} />
				</div>
				<div className="absolute bottom-20 right-10 transform rotate-12">
					<Building size={300} strokeWidth={0.5} />
				</div>
			</div>

			<div className="max-w-max mx-auto text-center relative z-10">
				{/* 404 Graphic */}
				<div className="relative mb-8 inline-block">
					<h1 className="text-9xl font-light text-[#D4A024] select-none tracking-widest opacity-20">
						404
					</h1>
				</div>

				<div className="space-y-6">
					<div>
						<h2 className="text-3xl font-light text-gray-900 sm:text-4xl">
							Property Not Found
						</h2>
						<p className="mt-2 text-lg text-gray-600 font-light max-w-md mx-auto">
							The listing you are looking for might have been taken off the
							market, relocated, or never existed.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
						<Link
							to="/"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-light rounded-md text-white bg-[#D4A024] hover:bg-[#B8881C] transition-colors shadow-sm gap-2"
						>
							<Home size={18} />
							Return Home
						</Link>
						<Link
							to="/marketplace"
							className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-light rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm gap-2"
						>
							<MapPin size={18} />
							Browse Marketplace
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
