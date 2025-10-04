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
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const toast = useRef(null);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = async () => {
		setLoading(true);
		if (!email || !password) {
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
				body: JSON.stringify({ email, password }),
			});

			if (response?.success) {
				login(response.data);
				if (response.data.role === 'Admin') navigate('/admin/dashboard');
				else if (response.data.role === 'Manager') navigate('/manager/dashboard');
				else if (response.data.role === 'Employee') navigate('/employee/dashboard');
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

					<h2 className="text-3xl font-bold text-primary text-center my-10">Login</h2>
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
							New User?{' '}
							<button
								onClick={() => navigate('/register')}
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
