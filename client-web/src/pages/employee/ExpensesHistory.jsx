import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import {
	ArrowUpDown,
	ArrowDownNarrowWide,
	ArrowUpNarrowWide,
	SquareArrowOutUpRight,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

export default function ExpensesHistory() {
	const dummyExpenses = [
		{
			date: '2023-10-01',
			category: 'Travel',
			amount: 500,
			status: 'Approved',
			title: 'Flight Ticket',
			paidBy: 'Alice',
			remarks: 'Business trip',
		},
		{
			date: '2023-10-02',
			category: 'Food',
			amount: 100,
			status: 'Pending',
			title: 'Lunch',
			paidBy: 'Bob',
			remarks: 'Team lunch',
		},
		{
			date: '2023-10-03',
			category: 'Misc',
			amount: 200,
			status: 'Rejected',
			title: 'Stationery',
			paidBy: 'Alice',
			remarks: 'Office supplies',
		},
		{
			date: '2023-10-04',
			category: 'Misc',
			amount: 300,
			status: 'Draft',
			title: 'Taxi',
			paidBy: 'Charlie',
			remarks: 'Airport pickup',
		},
	];

	const [filters, setFilters] = useState({});
	const [globalFilterValue, setGlobalFilterValue] = useState('');
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [currentPage, setCurrentPage] = useState(0);

	const navigate = useNavigate();

	const customSortIcon = ({ sortOrder }) => (
		<span>
			{sortOrder === 1 ? (
				<ArrowDownNarrowWide className="text-white w-4 h-4" />
			) : sortOrder === -1 ? (
				<ArrowUpNarrowWide className="text-white w-4 h-4" />
			) : (
				<ArrowUpDown className="text-white w-4 h-4 my-auto ml-2" />
			)}
		</span>
	);

	const statusTemplate = (row) => {
		const status = row.status;
		return (
			<span
				className={`px-3 py-1 rounded-full text-sm font-medium ${
					status === 'Approved'
						? 'bg-green-100 text-green-800'
						: status === 'Rejected'
						? 'bg-red-100 text-red-800'
						: status === 'Pending'
						? 'bg-yellow-100 text-yellow-800'
						: 'bg-gray-200 text-gray-800'
				}`}
			>
				{status}
			</span>
		);
	};

	const actionTemplate = (row) => (
		<>
			<Button
				className="p-button-rounded p-button-secondary p-button-text"
				icon={<SquareArrowOutUpRight size={20} />}
				onClick={() => navigate(`/expenses/tracking/${row.date}`)}
				id={`track-btn-${row.date}`}
			/>
			<Tooltip target={`#track-btn-${row.date}`} content="Go to tracking" position="top" />
		</>
	);

	// Compute totals for cards
	const [totals, setTotals] = useState({ Draft: 0, Pending: 0, Approved: 0 });

	useEffect(() => {
		const draftTotal = dummyExpenses
			.filter((e) => e.status === 'Draft')
			.reduce((acc, curr) => acc + curr.amount, 0);
		const pendingTotal = dummyExpenses
			.filter((e) => e.status === 'Pending')
			.reduce((acc, curr) => acc + curr.amount, 0);
		const approvedTotal = dummyExpenses
			.filter((e) => e.status === 'Approved')
			.reduce((acc, curr) => acc + curr.amount, 0);

		setTotals({ Draft: draftTotal, Pending: pendingTotal, Approved: approvedTotal });
	}, []);

	return (
		<PageLayout>
			<div className="container p-5">
				<div className="flex items-center gap-1 mb-7">
					<h1 className="text-3xl font-bold text-primary">Expense History</h1>
				</div>

				<div className="flex gap-6 mb-10">
					<div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg rounded-xl p-5 transform hover:-translate-y-1 transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-base font-semibold text-gray-600 uppercase tracking-wide">
									Draft Total
								</p>
								<p className="text-2xl font-bold text-gray-800 mt-2">
									{totals.Draft} USD
								</p>
							</div>
							<div className="bg-gray-300 p-3 rounded-full">
								<svg
									className="w-6 h-6 text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 7v4h4M21 17v-4h-4M3 17v-4h4M21 7v4h-4"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="flex-1 bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-lg rounded-xl p-5 transform hover:-translate-y-1 transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-base font-semibold text-yellow-700 uppercase tracking-wide">
									Pending Total
								</p>
								<p className="text-2xl font-bold text-yellow-800 mt-2">
									{totals.Pending} USD
								</p>
							</div>
							<div className="bg-yellow-300 p-3 rounded-full">
								<svg
									className="w-6 h-6 text-yellow-700"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="flex-1 bg-gradient-to-r from-green-100 to-green-200 shadow-lg rounded-xl p-5 transform hover:-translate-y-1 transition-all duration-300">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-base font-semibold text-green-700 uppercase tracking-wide">
									Approved Total
								</p>
								<p className="text-2xl font-bold text-green-800 mt-2">
									{totals.Approved} USD
								</p>
							</div>
							<div className="bg-green-300 p-3 rounded-full">
								<svg
									className="w-6 h-6 text-green-700"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div className="pl-0">
					<DataTable
						value={dummyExpenses}
						dataKey="_id"
						filters={filters}
						globalFilter={globalFilterValue}
						filterDisplay="menu"
						onFilter={(e) => setFilters(e.filters)}
						globalFilterFields={[
							'date',
							'category',
							'amount',
							'status',
							'title',
							'paidBy',
							'remarks',
						]}
						emptyMessage="No expenses found."
						stripedRows
						removableSort
						paginator
						paginatorClassName="bg-transparent border-none"
						sortIcon={customSortIcon}
						rows={rowsPerPage}
						rowsPerPageOptions={[5, 10, 25, 50]}
						first={currentPage * rowsPerPage}
						onPage={(e) => {
							setCurrentPage(e.page);
							setRowsPerPage(e.rows);
						}}
						className="p-datatable-sm min-w-[1000px] [&_.p-column-filter-menu-button]:text-white"
						responsiveLayout="scroll"
					>
						<Column
							header="S.No"
							body={(rowData, { rowIndex }) =>
								currentPage * rowsPerPage + rowIndex + 1
							}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2 text-center"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300 text-center"
						/>
						<Column
							field="title"
							header="Title"
							sortable
							filter
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="date"
							header="Date"
							sortable
							filter
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="category"
							header="Category"
							sortable
							filter
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="amount"
							header="Amount"
							sortable
							filter
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="paidBy"
							header="Paid By"
							sortable
							filter
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="remarks"
							header="Remarks"
							sortable
							filter
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
						/>
						<Column
							field="status"
							header="Status"
							sortable
							filter
							body={statusTemplate}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2 text-center"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300 text-center"
						/>
						<Column
							header="Action"
							body={actionTemplate}
							bodyClassName="text-text text-md border border-gray-300 px-3 py-2 text-center"
							headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300 text-center"
						/>
					</DataTable>
				</div>
			</div>
		</PageLayout>
	);
}
