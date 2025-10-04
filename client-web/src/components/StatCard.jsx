import React from 'react';

export default function StatCard({
	label,
	value,
	bgColor = 'bg-white',
	accent = 'border-l-blue-500',
	icon,
}) {
	// derive a light background and text color from the accent class when bgColor not provided
	const deriveColors = (accentClass) => {
		const c = (accentClass || '').toLowerCase();
		if (c.includes('green')) return { bg: 'bg-green-50', text: 'text-green-800' };
		if (c.includes('red')) return { bg: 'bg-red-50', text: 'text-red-800' };
		if (c.includes('yellow')) return { bg: 'bg-yellow-50', text: 'text-yellow-800' };
		if (c.includes('purple')) return { bg: 'bg-purple-50', text: 'text-purple-800' };
		if (c.includes('blue')) return { bg: 'bg-blue-50', text: 'text-blue-800' };
		return { bg: 'bg-white', text: 'text-gray-800' };
	};

	const derived = deriveColors(accent);
	const outerBg = bgColor || derived.bg;

	return (
		<div
			className={`flex-1 ${outerBg} rounded-xl shadow-lg justify-between p-6 flex items-center gap-6 border-l-4 ${accent}`}
		>
			<div>
				<div className="text-md text-gray-600 font-medium">{label}</div>
				<div className={`text-3xl font-extrabold ${derived.text}`}>{value}</div>
			</div>
			<div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center text-2xl font-semibold">
				{icon}
			</div>
		</div>
	);
}
