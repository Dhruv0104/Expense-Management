import React, { useState } from 'react';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import PageLayout from '../../components/layout/PageLayout';
import { useNavigate } from 'react-router-dom';
import {
	SquareArrowOutUpRight,
	CreditCard,
	Clock,
	CheckCircle,
	XCircle,
	PieChart,
	TrendingUp,
} from 'lucide-react';

export default function Dashboard({}) {
	const navigate = useNavigate();

	const user = {
		id: 'u12345',
		name: 'John Doe',
		email: 'john.doe@example.com',
		role: 'Employee',
		companyId: 'c98765',
	};

	const expenses = [
		{
			date: '2023-10-01',
			title: 'Flight',
			category: 'Travel',
			amount: 500,
			status: 'Approved',
			paidBy: 'John Doe',
			remarks: 'Business trip',
		},
		{
			date: '2023-10-02',
			title: 'Lunch',
			category: 'Food',
			amount: 100,
			status: 'Pending',
			paidBy: 'John Doe',
			remarks: 'Team lunch',
		},
		{
			date: '2023-10-03',
			title: 'Stationery',
			category: 'Misc',
			amount: 200,
			status: 'Rejected',
			paidBy: 'John Doe',
			remarks: 'Office supplies',
		},
		{
			date: '2023-10-04',
			title: 'Taxi',
			category: 'Travel',
			amount: 300,
			status: 'Draft',
			paidBy: 'John Doe',
			remarks: 'Local travel',
		},
		{
			date: '2023-10-10',
			title: 'Dinner',
			category: 'Food',
			amount: 150,
			status: 'Approved',
			paidBy: 'John Doe',
			remarks: 'Client dinner',
		},
		{
			date: '2023-10-15',
			title: 'Cab',
			category: 'Travel',
			amount: 80,
			status: 'Pending',
			paidBy: 'John Doe',
			remarks: 'Office commute',
		},
	];

	const totals = expenses.reduce((acc, exp) => {
		acc[exp.status] = (acc[exp.status] || 0) + exp.amount;
		return acc;
	}, {});

	const statusColors = {
		Approved: 'bg-green-100 text-green-800',
		Rejected: 'bg-red-100 text-red-800',
		Pending: 'bg-yellow-100 text-yellow-800',
		Draft: 'bg-gray-100 text-gray-800',
	};

	const btnClasses =
		'bg-primary text-white text-lg px-5 py-2 rounded hover:primary-hover font-semibold';
	const dropdownClases =
		'w-full rounded border border-gray-300 transition-all focus-within:shadow-none focus-within:ring-2 focus-within:ring-primary hover:border-primary';

	const months = Array.from({ length: 12 }, (_, i) => ({
		name: new Date(0, i).toLocaleString('default', { month: 'long' }),
		value: i,
	}));
	const weeks = [
		{ name: 'Week 1', value: 1 },
		{ name: 'Week 2', value: 2 },
		{ name: 'Week 3', value: 3 },
		{ name: 'Week 4', value: 4 },
		{ name: 'Week 5', value: 5 },
	];

	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [selectedWeek, setSelectedWeek] = useState(null);

	const getWeekNumber = (date) => {
		const d = new Date(date);
		const start = new Date(d.getFullYear(), d.getMonth(), 1);
		return Math.ceil((d.getDate() + start.getDay()) / 7);
	};

	const filteredExpenses = expenses.filter((e) => new Date(e.date).getMonth() === selectedMonth);
	const finalFiltered = selectedWeek
		? filteredExpenses.filter((e) => getWeekNumber(e.date) === selectedWeek)
		: filteredExpenses;

	const weeksCount = [0, 0, 0, 0, 0];
	finalFiltered.forEach((e) => {
		const weekNum = getWeekNumber(e.date);
		if (weekNum >= 1 && weekNum <= 5) weeksCount[weekNum - 1] += 1;
	});

	const weeklyChartData = {
		labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
		datasets: [
			{
				label: 'Expenses Submitted',
				backgroundColor: ['#d1e0f0', '#a3c2df', '#75a3cf', '#477fbf', '#336699'],
				data: weeksCount,
			},
		],
	};

	const categoryChartData = {
		labels: ['Travel', 'Food', 'Misc'],
		datasets: [
			{
				data: ['Travel', 'Food', 'Misc'].map((cat) =>
					expenses.filter((e) => e.category === cat).reduce((a, b) => a + b.amount, 0)
				),
				backgroundColor: ['#3B82F6', '#FBBF24', '#EF4444'],
			},
		],
	};

	return (
		<PageLayout>
			<div className="container p-5">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
					<div>
						<h1 className="text-4xl font-bold text-primary mb-1">Hello, {user.name}</h1>
						<p className="text-md text-gray-500 font-medium">{user.role}</p>
					</div>
					<Button
						label="Submit Expense"
						className={`${btnClasses} shadow-lg`}
						onClick={() => navigate('/employee/submit-expense')}
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
					{[
						{
							label: 'Draft',
							total: totals.Draft || 0,
							icon: <Clock size={28} />,
							bg: 'bg-gray-100',
							text: 'text-gray-800',
						},
						{
							label: 'Pending',
							total: totals.Pending || 0,
							icon: <CreditCard size={28} />,
							bg: 'bg-yellow-100',
							text: 'text-yellow-800',
						},
						{
							label: 'Approved',
							total: totals.Approved || 0,
							icon: <CheckCircle size={28} />,
							bg: 'bg-green-100',
							text: 'text-green-800',
						},
						{
							label: 'Rejected',
							total: totals.Rejected || 0,
							icon: <XCircle size={28} />,
							bg: 'bg-red-100',
							text: 'text-red-800',
						},
					].map((card, idx) => (
						<div
							key={idx}
							className={`flex items-center justify-between ${card.bg} ${card.text} shadow-lg rounded-xl p-5 hover:shadow-2xl transition`}
						>
							<div>
								<p className="text-sm font-semibold uppercase">
									{card.label} Total
								</p>
								<p className="text-2xl font-bold">{card.total} USD</p>
							</div>
							<div className="p-3 bg-white rounded-full shadow">{card.icon}</div>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-7">
						<div className="shadow-md border border-gray-200 h-full flex flex-col rounded-xl hover:shadow-lg">
							<div className="px-6 py-5 flex-1 flex flex-col">
								<div className="flex justify-between">
									<h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-3">
										<TrendingUp size={24} className="text-primary" />
										Expenses Submitted Per Week
									</h3>
									<div className="flex gap-4 mb-4">
										<Dropdown
											value={selectedMonth}
											options={months}
											onChange={(e) => setSelectedMonth(e.value)}
											optionLabel="name"
											placeholder="Select Month"
											className={`${dropdownClases}`}
										/>
										<Dropdown
											value={selectedWeek}
											options={weeks}
											onChange={(e) => setSelectedWeek(e.value)}
											optionLabel="name"
											placeholder="Select Week"
											className={`${dropdownClases}`}
										/>
									</div>
								</div>
								<div className="flex-1">
									<Chart
										type="bar"
										data={weeklyChartData}
										options={{ maintainAspectRatio: false }}
										height={350}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-7">
						<div className="shadow-md border border-gray-200 h-full flex flex-col rounded-xl hover:shadow-lg">
							<div className="px-6 py-5 flex-1 flex flex-col">
								<h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-3">
									<PieChart size={24} className="text-primary" />
									Expenses by Category
								</h3>
								<div className="flex-1 flex justify-center items-center">
									<Chart
										type="pie"
										data={categoryChartData}
										options={{ maintainAspectRatio: false }}
										height={350}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</PageLayout>
	);
}
