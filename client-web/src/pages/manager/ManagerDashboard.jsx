import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import StatCard from '../../components/StatCard';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, PieChart } from 'lucide-react';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';

// Sample requests
const initialRequests = [
	{ id: 'REQ-001', employee: 'Sarah Johnson', status: 'Pending' },
	{ id: 'REQ-002', employee: 'Mark Lee', status: 'Pending' },
	{ id: 'REQ-003', employee: 'Anita Gomez', status: 'Approved' },
	{ id: 'REQ-004', employee: 'John Doe', status: 'Rejected' },
	{ id: 'REQ-005', employee: 'Emma Brown', status: 'Pending' },
];

// Sample expenses
const initialExpenses = [
	{ date: '2023-01-15', amount: 500, status: 'Approved' },
	{ date: '2023-02-10', amount: 300, status: 'Pending' },
	{ date: '2023-02-25', amount: 200, status: 'Rejected' },
	{ date: '2023-03-05', amount: 100, status: 'Approved' },
	{ date: '2023-04-12', amount: 450, status: 'Approved' },
];

export default function ManagerDashboard() {
	// Status counts
	const approved = initialRequests.filter((r) => r.status === 'Approved').length;
	const rejected = initialRequests.filter((r) => r.status === 'Rejected').length;
	const pending = initialRequests.filter((r) => r.status === 'Pending').length;

	// Dropdown options for expenses chart
	const chartOptions = [
		{ label: 'Month-wise', value: 'month' },
		{ label: 'Year-wise', value: 'year' },
	];

	const [chartView, setChartView] = useState('month');

	// Prepare request chart data
	const requestChartData = {
		labels: ['Approved', 'Pending', 'Rejected'],
		datasets: [
			{
				label: 'Requests',
				backgroundColor: ['#34D399', '#FBBF24', '#F87171'], // green, yellow, red
				data: [approved, pending, rejected],
			},
		],
	};

	// Prepare expenses chart
	const groupExpenses = (view) => {
		if (view === 'month') {
			const monthlyTotals = Array(12).fill(0);
			initialExpenses.forEach((e) => {
				const month = new Date(e.date).getMonth();
				monthlyTotals[month] += e.amount;
			});
			return {
				labels: [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec',
				],
				datasets: [
					{
						label: 'Expenses',
						backgroundColor: '#3B82F6',
						data: monthlyTotals,
					},
				],
			};
		} else if (view === 'year') {
			const yearlyTotals = {};
			initialExpenses.forEach((e) => {
				const year = new Date(e.date).getFullYear();
				yearlyTotals[year] = (yearlyTotals[year] || 0) + e.amount;
			});
			return {
				labels: Object.keys(yearlyTotals),
				datasets: [
					{
						label: 'Expenses',
						backgroundColor: '#3B82F6',
						data: Object.values(yearlyTotals),
					},
				],
			};
		}
	};

	const expenseChartData = groupExpenses(chartView);

	return (
		<PageLayout>
			<div className="max-w-7xl mx-auto p-6">
				<header className="mb-6">
					<h1 className="text-3xl font-bold text-slate-800">Manager Dashboard</h1>
					<p className="text-sm text-slate-500 mt-1">
						Overview of approvals and expenses
					</p>
				</header>

				<div className="w-full flex flex-col sm:flex-row gap-4 mb-8">
					<StatCard
						label="Approved"
						value={approved}
						bgColor="bg-green-100"
						accent="border-l-green-500"
						icon={<CheckCircle className="text-green-600" />}
					/>
					<StatCard
						label="Rejected"
						value={rejected}
						bgColor="bg-red-100"
						accent="border-l-red-500"
						icon={<XCircle className="text-red-600" />}
					/>
					<StatCard
						label="Pending"
						value={pending}
						bgColor="bg-yellow-100"
						accent="border-l-yellow-400"
						icon={<AlertCircle className="text-yellow-600" />}
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Requests Status Chart */}
					<div className="shadow-md border border-gray-200 h-full flex flex-col rounded-xl p-5">
						<h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-3">
							<PieChart size={24} className="text-primary" />
							Requests Status
						</h3>
						<Chart type="bar" data={requestChartData} size={500} />
					</div>

					{/* Expenses Chart */}
					<div className="shadow-md border border-gray-200 h-full flex flex-col rounded-xl p-5">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-primary flex items-center gap-3">
								<TrendingUp size={24} className="text-primary" />
								Expenses Overview
							</h3>
							<Dropdown
								value={chartView}
								options={chartOptions}
								onChange={(e) => setChartView(e.value)}
								optionLabel="label"
								className="w-40"
							/>
						</div>
						<Chart
							type="line"
							data={expenseChartData}
							height={350}
							options={{ maintainAspectRatio: false }}
						/>
					</div>
				</div>
			</div>
		</PageLayout>
	);
}
