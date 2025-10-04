import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import StatCard from '../../components/StatCard';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const initialRequests = [
	{ id: 'REQ-001', employee: 'Sarah Johnson', status: 'Pending' },
	{ id: 'REQ-002', employee: 'Mark Lee', status: 'Pending' },
	{ id: 'REQ-003', employee: 'Anita Gomez', status: 'Approved' },
	{ id: 'REQ-004', employee: 'John Doe', status: 'Rejected' },
	{ id: 'REQ-005', employee: 'Emma Brown', status: 'Pending' },
];

export default function ManagerDashboard() {
	const approved = initialRequests.filter((r) => r.status === 'Approved').length;
	const rejected = initialRequests.filter((r) => r.status === 'Rejected').length;
	const pending = initialRequests.filter((r) => r.status === 'Pending').length;

	return (
		<PageLayout>
			<div className="max-w-6xl mx-auto py-6">
				<header className="mb-6">
					<h1 className="text-3xl font-bold text-slate-800">Manager Dashboard</h1>
					<p className="text-sm text-slate-500 mt-1">
						Overview of approvals and pending requests
					</p>
				</header>

				<div className="w-full flex flex-col sm:flex-row gap-4">
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

				{/* <div className="mt-8">
					<p className="text-sm text-slate-600">
						Quick actions and recent activity can go here.
					</p>
				</div> */}
			</div>
		</PageLayout>
	);
}
