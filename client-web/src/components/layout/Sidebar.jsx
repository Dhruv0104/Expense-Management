import React from 'react';
import { Button } from 'primereact/button';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
	CalendarCheck2,
	LayoutDashboard,
	Table2,
	Group,
	MonitorDot,
	Tag,
	MessageSquareHeart,
	SquarePen,
	ReceiptText,
	Verified,
} from 'lucide-react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FaChalkboardTeacher, FaFileAlt } from 'react-icons/fa';

export default function Sidebar({ isVisible, onClose }) {
	const navigate = useNavigate();
	const { logout, role } = useAuth();
	// const role = 'faculty';

	const data = localStorage.getItem('data');
	const instituteId = data ? JSON.parse(data)?.instituteId : null;

	const roleBasedButtons = {
		// government: [
		// 	{
		// 		label: 'Dashboard',
		// 		icon: <LayoutDashboard size={23} />,
		// 		route: '/government/dashboard',
		// 	},
		// 	{
		// 		label: 'Create Contract',
		// 		icon: <SquarePen size={23} />,
		// 		route: '/government/create-smart-contract',
		// 	},
		// 	{
		// 		label: 'Active Contracts',
		// 		icon: <ReceiptText size={23} />,
		// 		route: '/government/active-contracts',
		// 	},
		// ],
		// producer: [
		// 	{
		// 		label: 'Dashboard',
		// 		icon: <LayoutDashboard size={23} />,
		// 		route: '/producer/dashboard',
		// 	},
		// 	{
		// 		label: 'My Subsidies',
		// 		icon: <FaFileAlt size={23} />,
		// 		route: '/producer/subsidies',
		// 	},
		// ],
		// auditor: [
		// 	{
		// 		label: 'Dashboard',
		// 		icon: <LayoutDashboard size={23} />,
		// 		route: '/auditor/dashboard',
		// 	},
		// 	{
		// 		label: 'Verify Milestones',
		// 		icon: <Verified size={23} />,
		// 		route: '/auditor/verify-milestones',
		// 	},
		// ],
	};

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	const handleLogoutConfirm = () => {
		confirmDialog({
			message: 'Are you sure you want to logout?',
			header: 'Logout Confirmation',
			icon: 'pi pi-sign-out',
			className: 'md:w-96 sm:w-90',
			acceptClassName: 'p-button-danger ml-3',
			rejectClassName: 'p-button-secondary p-button-text',
			acceptLabel: 'Yes',
			rejectLabel: 'No',
			draggable: false,
			accept: () => handleLogout(),
			reject: () => {},
		});
	};
	const buttons = roleBasedButtons[role] || [];

	return (
		<>
			<ConfirmDialog />
			<div className="h-full space-y-3.5 mt-4">
				{buttons.map(({ label, icon, route }) =>
					route === '#' ? (
						<Button
							key={label}
							label={label}
							icon={icon}
							className="w-full text-xl font-semibold flex items-center gap-2 px-3 py-2 rounded p-button-text text-left text-disabled cursor-not-allowed opacity-60"
							disabled
						/>
					) : (
						<NavLink
							key={label}
							to={route}
							className={({ isActive }) =>
								`w-full text-xl font-semibold my-auto flex items-center gap-2 px-3 py-2 rounded transition-all duration-300 ${
									isActive
										? 'bg-card text-primary shadow-md'
										: 'text-white hover:bg-card hover:text-primary hover:shadow-md'
								}`
							}
							onClick={onClose}
						>
							<div className="flex gap-2.5 my-auto">
								<span className="text-xl my-auto">
									{typeof icon === 'string' ? (
										<i className={icon} style={{ fontSize: '1.5rem' }}></i>
									) : (
										icon
									)}
								</span>
								<span className="text-xl mb-0.5">{label}</span>
							</div>
						</NavLink>
					)
				)}

				<Button
					label={<div className="text-xl font-semibold mb-1">Logout</div>}
					icon={
						<i className="pi pi-sign-out mr-1 my-auto" style={{ fontSize: '1.5rem' }} />
					}
					className="w-full my-auto p-button-text text-left text-white hover:bg-card hover:text-primary hover:shadow-md transition-all duration-300 [&_.pi]:text-xl gap-1"
					onClick={handleLogoutConfirm}
				/>
			</div>
		</>
	);
}
