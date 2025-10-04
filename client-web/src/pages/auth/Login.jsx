import React, { useState, useRef } from 'react';
import { fetchPost } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import logo from '../../assets/logo.png';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState(null);
	const [loading, setLoading] = useState(false);
	const toast = useRef(null);
	const navigate = useNavigate();
	const { login } = useAuth();

	const roles = [
		{ label: 'Government', value: 'government' },
		{ label: 'Auditor', value: 'auditor' },
		{ label: 'Producer', value: 'producer' },
	];

	const handleLogin = async () => {
		setLoading(true);
		if (!username || !password || !role) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'All fields are required',
			});
			setLoading(false);
			return;
		}
		try {
			const response = await fetchPost({
				pathName: 'auth/login',
				body: JSON.stringify({ username, password, role }),
			});

			if (response?.success) {
				login(response.data);
				if (response.data.role === 'government') navigate('/government/dashboard');
				else if (response.data.role === 'auditor') navigate('/auditor/dashboard');
				else if (response.data.role === 'producer') navigate('/producer/dashboard');
				else navigate('/');
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: `${response?.message || 'Login failed'}`,
				});
			}
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Something Went Wrong!',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		navigate('/forgot-password');
	};

	return (
		<>
			<Toast ref={toast} />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-white to-gray-100 px-4">
				<h1 className="text-4xl font-extrabold text-primary mb-16 tracking-wide drop-shadow-sm overflow-hidden whitespace-nowrap border-r-4 border-primary animate-typing">
					Subsidy<span className="text-gray-800">Track</span>
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

					<h2 className="text-3xl font-bold text-primary text-center my-10">Login</h2>
					<div className="mb-4">
						<label htmlFor="role" className="block text-primary font-medium mb-1">
							Role
						</label>
						<Dropdown
							value={role}
							onChange={(e) => setRole(e.value)}
							options={roles}
							optionLabel="label"
							placeholder="Select a Role"
							className="w-full md:w-14rem"
						/>
					</div>
					<div className="mb-4">
						<label htmlFor="username" className="block text-primary font-medium mb-1">
							Username
						</label>
						<InputText
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary"
						/>
					</div>

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

					<Button
						label={<div className="text-white font-semibold">Login</div>}
						onClick={handleLogin}
						loading={loading}
						className="w-full bg-primary hover:bg-[#2a547a] transition text-white font-semibold py-2.5 rounded shadow-sm transform hover:scale-105"
					/>
					<div className="mt-4 text-center">
						<span className="text-sm text-gray-600">
							New User?{" "}
							<button
								onClick={() => navigate("/producer/registration")}
								type="button"
								className="text-primary font-medium hover:underline"
							>
								Register
							</button>
						</span>
					</div>
					<div className="mt-4 flex flex-col items-end gap-2">
						<Button
							label={
								<span className="flex items-center gap-2">
									<i className=" text-lg" />
									<span>Reset Password</span>
								</span>
							}
							onClick={handleForgotPassword}
							className="text-primary hover:text-[#2a547a] bg-transparent border-none px-1 py-0 font-medium transform hover:scale-105 focus:ring-2 focus:ring-primary rounded"
							text
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
