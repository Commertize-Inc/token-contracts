import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Fix Leaflet generic marker icon issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
	address: string;
	city: string;
	state: string;
	zipCode: string;
}

export function MapView({ address, city, state, zipCode }: MapViewProps) {
	// Default to generic US coordinates (center of US roughly) if geocoding not implemented yet
	// Or maybe New York as a default
	const [position, setPosition] = useState<[number, number]>([
		40.7128, -74.006,
	]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// In a real app, we would use a geocoding API here.
		// For now, we'll try to use a free nominatim search if possible, with rate limiting care.
		// Or just stick to a default mock location based on city if known, or generic.

		const query = `${address}, ${city}, ${state} ${zipCode}`;

		// Using OpenStreetMap Nominatim (Free, but requires User-Agent and has limits)
		// We will fetch only once on mount
		const fetchCoordinates = async () => {
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
						query
					)}`,
					{
						headers: {
							"User-Agent": "CommertizeDashboard/1.0",
						},
					}
				);
				const data = await response.json();
				if (data && data.length > 0) {
					setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
				}
			} catch (error) {
				console.error("Geocoding failed:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchCoordinates();
	}, [address, city, state, zipCode]);

	if (loading) {
		return (
			<div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
				Loading Map...
			</div>
		);
	}

	return (
		<MapContainer
			center={position}
			zoom={13}
			scrollWheelZoom={false}
			style={{ height: "100%", width: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Marker position={position}>
				<Popup>
					{address} <br /> {city}, {state}
				</Popup>
			</Marker>
		</MapContainer>
	);
}
