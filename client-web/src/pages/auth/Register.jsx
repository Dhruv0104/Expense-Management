import React, { useState, useEffect, useRef } from 'react';
import { fetchPost } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import logo from '../../assets/logo.png';

export default function Register() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [country, setCountry] = useState(null);
	const [countries, setCountries] = useState([]);
	const [loading, setLoading] = useState(false);

	const toast = useRef(null);
	const navigate = useNavigate();

	// Fetch countries and currencies
	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const res = await fetch(
					'https://restcountries.com/v3.1/all?fields=name,currencies'
				);
				const data = await res.json();
				const formatted = data.map((c) => {
					const currencyCodes = c.currencies ? Object.keys(c.currencies) : [];
					return {
						label: `${c.name.common} (${currencyCodes[0] || 'N/A'})`,
						value: {
							country: c.name.common,
							currency: currencyCodes[0] || '',
						},
					};
				});
				// Sort alphabetically
				formatted.sort((a, b) => a.label.localeCompare(b.label));
				setCountries(formatted);
			} catch (error) {
				console.error(error);
			}
		};
		fetchCountries();
	}, []);

	const handleRegister = async () => {
		if (!name || !email || !password || !confirmPassword || !country) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'All fields are required',
			});
			return;
		}
		if (password !== confirmPassword) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Passwords do not match',
			});
			return;
		}

		setLoading(true);
		try {
			const response = await fetchPost({
				pathName: 'auth/register',
				body: JSON.stringify({
					name,
					email,
					password,
					country: country.country,
					currency: country.currency,
				}),
			});

			if (response?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Registration successful',
				});
				setTimeout(() => {
					navigate('/'); // Redirect to dashboard/home after signup
				}, 2000);
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: `${response?.message || 'Registration failed'}`,
				});
			}
		} catch (error) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Something went wrong!',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Toast ref={toast} />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-white to-gray-100 px-4">
				<h1 className="text-4xl font-extrabold text-primary mb-16 tracking-wide drop-shadow-sm overflow-hidden whitespace-nowrap border-r-4 border-primary animate-typing">
					Expense <span className="text-gray-800">Management</span>
				</h1>

				<div className="relative w-full max-w-md p-8 rounded-xl shadow-lg backdrop-blur-md bg-white/30 border border-white/40">
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
						<Avatar
							image={logo}
							size="xlarge"
							shape="circle"
							className="size-24 shadow-lg border-4 border-white bg-primary/3 p-1.5"
						/>
					</div>

					<h2 className="text-3xl font-bold text-primary text-center my-10">Sign Up</h2>

					{/* Name */}
					<div className="mb-4">
						<label htmlFor="name" className="block text-primary font-medium mb-1">
							Name
						</label>
						<InputText
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter your name"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary"
						/>
					</div>

					{/* Email */}
					<div className="mb-4">
						<label htmlFor="email" className="block text-primary font-medium mb-1">
							Email
						</label>
						<InputText
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary"
						/>
					</div>

					{/* Password */}
					<div className="mb-4">
						<label htmlFor="password" className="block text-primary font-medium mb-1">
							Password
						</label>
						<InputText
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary"
						/>
					</div>

					{/* Confirm Password */}
					<div className="mb-4">
						<label
							htmlFor="confirmPassword"
							className="block text-primary font-medium mb-1"
						>
							Confirm Password
						</label>
						<InputText
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Re-enter your password"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary"
						/>
					</div>

					{/* Country + Currency */}
					<div className="mb-4">
						<label htmlFor="country" className="block text-primary font-medium mb-1">
							Country & Currency
						</label>
						<Dropdown
							id="country"
							value={country}
							onChange={(e) => setCountry(e.value)}
							options={countries}
							placeholder="Select Country"
							className="w-full"
							filter
							showClear
						/>
					</div>

					<Button
						label={<div className="text-white font-semibold">Sign Up</div>}
						onClick={handleRegister}
						loading={loading}
						className="w-full bg-primary hover:bg-[#2a547a] transition text-white font-semibold py-2.5 rounded shadow-sm transform hover:scale-105"
					/>
					<div className="mt-4 text-center">
						<span className="text-sm text-gray-600">
							Already have an account?{' '}
							<button
								onClick={() => navigate('/login')}
								type="button"
								className="text-primary font-medium hover:underline"
							>
								Login
							</button>
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
