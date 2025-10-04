import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import { Paperclip } from 'lucide-react';
import {
	ArrowUpDown,
	ArrowDownNarrowWide,
	ArrowUpNarrowWide,
	SquareArrowOutUpRight,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';

export default function ExpensesHistory() {
	const [filters, setFilters] = useState({});
	const [globalFilterValue, setGlobalFilterValue] = useState('');
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [currentPage, setCurrentPage] = useState(0);
	const [expenses, setExpenses] = useState([]);
	const [formData, setFormData] = useState({ ocrReceipt: null });
	const toast = useRef(null);

	const navigate = useNavigate();
	const fetchExpenses = async () => {
		try {
			const res = await fetchGet({ pathName: 'employee/fetch-expenses' });
			if (res?.success) {
				setExpenses(res.data);
				computeTotals(res.data);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const computeTotals = (data) => {
		const draftTotal = data
			.filter((e) => e.status.toUpperCase() === 'DRAFT')
			.reduce((acc, curr) => acc + curr.amount, 0);
		const pendingTotal = data
			.filter((e) => e.status.toUpperCase() === 'PENDING')
			.reduce((acc, curr) => acc + curr.amount, 0);
		const approvedTotal = data
			.filter((e) => e.status.toUpperCase() === 'APPROVED')
			.reduce((acc, curr) => acc + curr.amount, 0);
		setTotals({ Draft: draftTotal, Pending: pendingTotal, Approved: approvedTotal });
	};

	useEffect(() => {
		fetchExpenses();
	}, []);

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
				className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'Approved'
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
				onClick={() => navigate(`/employee/tracking/${row._id}`)}
			// id={`track-btn-${row.date}`}
			/>
			<Tooltip target={`#track-btn-${row.date}`} content="Go to tracking" position="top" />
		</>
	);

	const handleOcrSubmit = async () => {
		try {
			if (!formData.ocrReceipt) {
				toast.current.show({
					severity: 'warn',
					summary: 'No File Selected',
					detail: 'Please upload a file before posting.',
					life: 2000,
				});
				return;
			}

			const payload = new FormData();
			payload.append('receipt', formData.ocrReceipt);

			const token = localStorage.getItem('token');
			const res = await fetch(`${import.meta.env.VITE_URL}employee/submit-by-ocr`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: payload,
			});

			const data = await res.json();

			if (res.ok) {
				setTimeout(() => {
					setFormData({ ocrReceipt: null });
					toast.current.show({
						severity: 'success',
						summary: 'Success',
						detail: 'Expense submitted successful!',
						life: 900,
					});
					// window.location.reload();
				}, 900);
			} else {
				throw new Error(data.message || 'Submission failed');
			}
		} catch (error) {
			console.error(error);
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: error.message || 'Failed to submit OCR document.',
				life: 2000,
			});
		}
	};

	const [totals, setTotals] = useState({ Draft: 0, Pending: 0, Approved: 0 });
	const btnClasses =
		'bg-primary text-white text-lg px-5 py-2 rounded hover:primary-hover font-semibold';

	return (
		<PageLayout>
			<Toast ref={toast} />
			<div className="container p-5">
				<div className="flex justify-between items-center gap-1 mb-7">
					<h1 className="text-3xl font-bold text-primary">Expense History</h1>
					<div className="flex items-center gap-6 cursor-pointer">
						<div className="relative inline-block cursor-pointer">
							<label
								htmlFor="ocrUpload"
								className={`cursor-pointer inline-flex items-center justify-center font-normal ${btnClasses}`}
							>
								Attach Receipt
							</label>
							<input
								id="ocrUpload"
								type="file"
								name="ocrReceipt"
								accept="image/*,application/pdf"
								onChange={(e) =>
									setFormData({ ...formData, ocrReceipt: e.target.files[0] })
								}
								className="absolute inset-0 opacity-0 cursor-pointer"
							/>
						</div>
						{formData?.ocrReceipt && (
							<div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg shadow-sm">
								<h4 className="text-base font-semibold text-gray-700 flex items-center gap-2">
									<Paperclip size={18} /> {formData.ocrReceipt.name}
								</h4>
								<Button
									icon="pi pi-trash"
									className="p-button-rounded p-button-text p-button-danger ml-2"
									onClick={() => setFormData({ ...formData, ocrReceipt: null })}
									aria-label="Remove File"
								/>
							</div>
						)}

						{formData?.ocrReceipt && (
							<Button
								label="Submit"
								className={`w-32 ${btnClasses}`}
								onClick={handleOcrSubmit}
							/>
						)}
					</div>
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
						value={expenses}
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
							header="Live Tracking"
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
