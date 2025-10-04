import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import StatCard from '../../components/StatCard';
import {
    Users,
    UserCheck,
    UserCog,
    Clock,
    CheckCircle,
    DollarSign,
    PieChart,
    TrendingUp,
} from 'lucide-react';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { fetchGet } from '../../utils/fetch.utils';

export default function AdminDashboard() {
    const [data, setData] = useState({
        totalUsers: 0,
        totalManagers: 0,
        totalEmployees: 0,
        totalPendingRequests: 0,
        totalApprovedRequests: 0,
        totalRejectedRequests: 0,
        totalExpense: 0,
        expenses: [],
    });

    const [chartView, setChartView] = useState('month');

    const chartOptions = [
        { label: 'Month-wise', value: 'month' },
        { label: 'Year-wise', value: 'year' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchGet({ pathName: 'admin/dashboard-stats' });
                const stats = response.data;
                setData({ ...stats, expenses: response.data.expenses || [] });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    // Charts
    const requestStatusChart = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                data: [
                    data.totalApprovedRequests,
                    data.totalPendingRequests,
                    data.totalRejectedRequests,
                ],
                backgroundColor: ['#34D399', '#FBBF24', '#F87171'],
                hoverBackgroundColor: ['#10B981', '#FACC15', '#EF4444'],
            },
        ],
    };

    const roleChart = {
        labels: ['Managers', 'Employees'],
        datasets: [
            {
                data: [data.totalManagers, data.totalEmployees],
                backgroundColor: ['#60A5FA', '#A78BFA'],
                hoverBackgroundColor: ['#3B82F6', '#8B5CF6'],
            },
        ],
    };

    const groupExpenses = (view) => {
        if (!data.expenses || data.expenses.length === 0) return { labels: [], datasets: [] };

        if (view === 'month') {
            const monthlyTotals = Array(12).fill(0);
            data.expenses.forEach((e) => {
                const month = new Date(e.date).getMonth();
                monthlyTotals[month] += e.amount;
            });
            return {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Expenses (USD)',
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59,130,246,0.2)',
                        fill: true,
                        tension: 0.4,
                        data: monthlyTotals,
                    },
                ],
            };
        } else {
            const yearlyTotals = {};
            data.expenses.forEach((e) => {
                const year = new Date(e.date).getFullYear();
                yearlyTotals[year] = (yearlyTotals[year] || 0) + e.amount;
            });
            return {
                labels: Object.keys(yearlyTotals),
                datasets: [
                    {
                        label: 'Expenses (USD)',
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59,130,246,0.2)',
                        fill: true,
                        tension: 0.4,
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
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Overview of users, requests, and expenses
                    </p>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total Users" value={data.totalUsers} bgColor="bg-blue-100" accent="border-l-blue-500" icon={<Users className="text-blue-600" />} />
                    <StatCard label="Total Managers" value={data.totalManagers} bgColor="bg-indigo-100" accent="border-l-indigo-500" icon={<UserCog className="text-indigo-600" />} />
                    <StatCard label="Total Employees" value={data.totalEmployees} bgColor="bg-purple-100" accent="border-l-purple-500" icon={<UserCheck className="text-purple-600" />} />
                    <StatCard label="Pending Requests" value={data.totalPendingRequests} bgColor="bg-yellow-100" accent="border-l-yellow-400" icon={<Clock className="text-yellow-600" />} />
                    <StatCard label="Approved Requests" value={data.totalApprovedRequests} bgColor="bg-green-100" accent="border-l-green-500" icon={<CheckCircle className="text-green-600" />} />
                    <StatCard label="Total Expenses" value={`$${data.totalExpense}`} bgColor="bg-teal-100" accent="border-l-teal-500" icon={<DollarSign className="text-teal-600" />} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="shadow-md border border-gray-200 rounded-xl p-5 flex flex-col">
                        <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2"><PieChart className="text-primary" /> Request Status</h3>
                        <Chart type="pie" data={requestStatusChart} height={320} />
                    </div>

                    <div className="shadow-md border border-gray-200 rounded-xl p-5 flex flex-col">
                        <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2"><Users className="text-primary" /> Role Distribution</h3>
                        <Chart type="doughnut" data={roleChart} height={320} />
                    </div>

                    <div className="shadow-md border border-gray-200 rounded-xl p-5 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-primary flex items-center gap-2"><TrendingUp className="text-primary" /> Expense Trends</h3>
                            <Dropdown
                                value={chartView}
                                options={chartOptions}
                                onChange={(e) => setChartView(e.value)}
                                optionLabel="label"
                                className="w-40"
                            />
                        </div>
                        <Chart type="line" data={expenseChartData} height={320} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
