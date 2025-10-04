import React, { useEffect, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import {
	ArrowUpDown,
	ArrowDownNarrowWide,
	ArrowUpNarrowWide,
	Eye,
	ReceiptText,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

// Mock expenses matching the server expense model
const initialRequests = [
	{
		_id: 'EXP-001',
		title: 'Flight to Conference',
		date: '2025-09-20T10:00:00.000Z',
		user: { _id: 'U1', name: 'Sarah Johnson', email: 'sarah@example.com' },
		category: 'Travel',
		paidBy: { _id: 'U1', name: 'Sarah Johnson' },
		status: 'PENDING',
		approverDecisions: [{ userId: 'M1', status: 'PENDING', comment: '', decidedAt: null }],
		amount: 12500,
		currency: 'INR',
		description: 'Flight ticket and airport taxi',
		receipt: 'https://via.placeholder.com/800x600.png?text=Receipt+EXP-001',
	},
	{
		_id: 'EXP-002',
		title: 'Team Lunch',
		date: '2025-09-18T13:30:00.000Z',
		user: { _id: 'U2', name: 'Mark Lee', email: 'mark@example.com' },
		category: 'Food',
		paidBy: { _id: 'U2', name: 'Mark Lee' },
		status: 'PENDING',
		approverDecisions: [{ userId: 'M1', status: 'PENDING', comment: '', decidedAt: null }],
		amount: 2300,
		currency: 'INR',
		description: 'Team lunch after project milestone',
		receipt: null,
	},
	{
		_id: 'EXP-003',
		title: 'Stationery Purchase',
		date: '2025-09-15T09:00:00.000Z',
		user: { _id: 'U3', name: 'Anita Gomez', email: 'anita@example.com' },
		category: 'Supplies',
		paidBy: { _id: 'U3', name: 'Anita Gomez' },
		status: 'APPROVED',
		approverDecisions: [
			{
				userId: 'M1',
				status: 'APPROVED',
				comment: 'Approved as per budget policy',
				decidedAt: '2025-09-16T12:00:00.000Z',
			},
		],
		amount: 780,
		currency: 'INR',
		description: 'Office stationery',
		receipt: 'https://via.placeholder.com/800x600.png?text=Receipt+EXP-003',
	},
	{
		_id: 'EXP-004',
		title: 'Online Training',
		date: '2025-09-12T15:00:00.000Z',
		user: { _id: 'U4', name: 'John Doe', email: 'john@example.com' },
		category: 'Training',
		paidBy: { _id: 'U4', name: 'John Doe' },
		status: 'REJECTED',
		approverDecisions: [
			{
				userId: 'M1',
				status: 'REJECTED',
				comment: 'Not aligned with current training plan',
				decidedAt: '2025-09-13T10:00:00.000Z',
			},
		],
		amount: 4500,
		currency: 'INR',
		description: 'Course fee',
		receipt: null,
	},
];

export default function ExpenseLog() {
	const [requests, setRequests] = useState(initialRequests);
	const [filters, setFilters] = useState({
		title: { value: null, matchMode: FilterMatchMode.CONTAINS },
		'user.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
		category: { value: null, matchMode: FilterMatchMode.CONTAINS },
		date: { value: null, matchMode: FilterMatchMode.CONTAINS },
		amount: { value: null, matchMode: FilterMatchMode.BETWEEN },
		status: { value: null, matchMode: FilterMatchMode.EQUALS },
	});
	const [globalFilterValue, setGlobalFilterValue] = useState('');
	const [currentPage, setCurrentPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, _setLoading] = useState(false);
	const toast = useRef(null);

	// Approve / Reject dialog state
	const [dialogVisible, setDialogVisible] = useState(false);
	const [dialogType, setDialogType] = useState(null); // 'approve' | 'reject'
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [actionMessage, setActionMessage] = useState('');

	useEffect(() => {
		// Future: fetch data from API
	}, []);

	const onGlobalFilterChange = (e) => {
		setGlobalFilterValue(e.target.value);
	};

	// Details dialog state
	const [detailsVisible, setDetailsVisible] = useState(false);
	const [activeExpense, setActiveExpense] = useState(null);

	const openDetails = (row) => {
		setActiveExpense(row);
		setDetailsVisible(true);
	};

	const clearFilters = () => {
		setFilters({
			id: { value: null, matchMode: FilterMatchMode.CONTAINS },
			employee: { value: null, matchMode: FilterMatchMode.CONTAINS },
			type: { value: null, matchMode: FilterMatchMode.CONTAINS },
			submittedDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
		});
		setGlobalFilterValue('');
	};

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

	const openConfirm = (rowData, type) => {
		setSelectedRequest(rowData);
		setDialogType(type);
		setActionMessage('');
		setDialogVisible(true);
	};

	const updateStatus = (id, newStatus, message) => {
		setRequests((prev) =>
			prev.map((r) =>
				r._id === id
					? {
							...r,
							status: newStatus,
							// store message as description note for simplicity
							message: message,
							approverDecisions: [
								...(r.approverDecisions || []),
								{
									userId: 'CURRENT_MANAGER',
									status: newStatus.toUpperCase(),
									comment: message,
									decidedAt: new Date().toISOString(),
								},
							],
					  }
					: r
			)
		);

		toast.current?.show({
			severity: 'success',
			summary: `${newStatus}`,
			detail: `Expense ${id} marked as ${newStatus}. ${message ? `Note: ${message}` : ''}`,
			life: 3000,
		});
	};

	const confirmAction = () => {
		if (!selectedRequest || !dialogType) return;
		const newStatus = dialogType === 'approve' ? 'Approved' : 'Rejected';
		updateStatus(selectedRequest.id, newStatus, actionMessage);
		closeDialog();
	};

	const closeDialog = () => {
		setDialogVisible(false);
		setDialogType(null);
		setSelectedRequest(null);
		setActionMessage('');
	};

	const actionsBody = (rowData) => {
		const isPending = (rowData.status || '').toString().toUpperCase() === 'PENDING';
		const badgeColor =
			(rowData.status || '').toString().toLowerCase() === 'approved'
				? 'bg-green-100 text-green-800'
				: (rowData.status || '').toString().toLowerCase() === 'rejected'
				? 'bg-red-100 text-red-800'
				: (rowData.status || '').toString().toLowerCase() === 'pending'
				? 'bg-yellow-100 text-yellow-800'
				: 'bg-gray-100 text-gray-800';
		return (
			<div className="flex items-center gap-2">
				{isPending ? (
					<>
						<Button
							tooltip="View"
							icon="pi pi-eye"
							tooltipOptions={{ position: 'top' }}
							onClick={() => openDetails(rowData)}
							className="p-button-sm p-button shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
							style={{ background: '#blue', border: 'none', color: 'white' }}
						/>

						<Button
							tooltip="Approve"
							tooltipOptions={{ position: 'top' }}
							icon="pi pi-check"
							className="p-button-sm p-button shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
							onClick={() => openConfirm(rowData, 'approve')}
							style={{ background: '#16a34a', border: 'none', color: 'white' }}
						/>

						<Button
							tooltip="Reject"
							icon="pi pi-times"
							tooltipOptions={{ position: 'top' }}
							className="p-button-sm p-button shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
							onClick={() => openConfirm(rowData, 'reject')}
							style={{ background: '#dc2626', border: 'none', color: 'white' }}
						/>
					</>
				) : (
					<div className="flex items-center gap-2">
						<div className={`px-3 py-1 text-sm font-medium rounded-full ${badgeColor}`}>
							{rowData.status || 'Unknown'}
						</div>
					</div>
				)}
			</div>
		);
	};

	const statusBadgeTemplate = (rowData) => {
		const status = (rowData?.status || 'Unknown').toString().toLowerCase();
		const badgeColor =
			status === 'approved'
				? 'bg-green-100 text-green-800'
				: status === 'rejected'
				? 'bg-red-100 text-red-800'
				: status === 'pending'
				? 'bg-yellow-100 text-yellow-800'
				: 'bg-gray-100 text-gray-800';

		return (
			<div className="flex items-center gap-2">
				<div className={`px-3 py-1 text-sm font-medium rounded-full ${badgeColor}`}>
					{rowData.status || 'Unknown'}
				</div>
			</div>
		);
	};

	const receiptBodyTemplate = (rowData) => {
		return rowData.receipt ? (
			<a
				href={rowData.receipt}
				target="_blank"
				rel="noopener noreferrer"
				className="text-indigo-600 hover:underline flex items-center gap-1"
			>
				<ReceiptText className="w-5 h-5" />
				Open
			</a>
		) : (
			<span className="text-slate-400 italic text-xs">Not uploaded</span>
		);
	};

	const idFilterTemplate = (options) => (
		<InputText
			value={options.value}
			onChange={(e) => options.filterCallback(e.target.value)}
			placeholder="Search ID"
		/>
	);
	const employeeFilterTemplate = (options) => (
		<InputText
			value={options.value}
			onChange={(e) => options.filterCallback(e.target.value)}
			placeholder="Search employee"
		/>
	);

	const amountFilterTemplate = (options) => (
		<div className="flex gap-2">
			<InputNumber
				value={options.value ? options.value[0] : null}
				onValueChange={(e) =>
					options.filterCallback(
						[e.value, options.value ? options.value[1] : null],
						options.index
					)
				}
				placeholder="Min"
				useGrouping={false}
				className="p-column-filter"
			/>
			<InputNumber
				value={options.value ? options.value[1] : null}
				onValueChange={(e) =>
					options.filterCallback(
						[options.value ? options.value[0] : null, e.value],
						options.index
					)
				}
				placeholder="Max"
				useGrouping={false}
				className="p-column-filter"
			/>
		</div>
	);

	const statusOptions = [
		{ label: 'Pending', value: 'PENDING' },
		{ label: 'Approved', value: 'APPROVED' },
		{ label: 'Rejected', value: 'REJECTED' },
	];

	const statusFilterTemplate = (options) => (
		<Dropdown
			value={options.value}
			options={statusOptions}
			onChange={(e) => options.filterCallback(e.value, options.index)}
			placeholder="Select status"
			className="p-column-filter"
		/>
	);

	const dialogFooter = (
		<div className="flex justify-end gap-3">
			<Button label="Cancel" className="p-button-text" onClick={closeDialog} />
			<Button
				label={dialogType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
				onClick={confirmAction}
				autoFocus
				disabled={dialogType === 'reject' && actionMessage.trim() === ''}
				className={dialogType === 'approve' ? 'p-button-success' : 'p-button-danger'}
			/>
		</div>
	);

	return (
		<PageLayout>
			<Toast ref={toast} />
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 my-4 px-3">
				<div>
					<h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800">
						Approvals to Review
					</h2>
					<p className="text-sm text-slate-500 mt-1">
						Review pending expense requests and approve or reject as necessary.
					</p>
				</div>
				<div className="flex items-center gap-2 w-full lg:w-auto">
					<InputText
						value={globalFilterValue}
						onChange={onGlobalFilterChange}
						placeholder="Search ID, employee or type..."
						className="w-full lg:w-72"
					/>
					<Button
						icon="pi pi-filter-slash"
						rounded
						outlined
						onClick={clearFilters}
						className="text-primary border-primary"
						tooltip="Clear Filters"
						tooltipOptions={{ position: 'bottom' }}
					/>
				</div>
			</div>

			<div className="w-full overflow-hidden px-3">
				<DataTable
					value={requests}
					dataKey="_id"
					loading={loading}
					filters={filters}
					globalFilter={globalFilterValue}
					filterDisplay="menu"
					onFilter={(e) => setFilters(e.filters)}
					globalFilterFields={['title', 'user.name', 'category', 'description']}
					emptyMessage="No requests found."
					stripedRows
					removableSort
					paginator
					sortIcon={customSortIcon}
					rows={rowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
					first={currentPage * rowsPerPage}
					onPage={(e) => {
						setCurrentPage(e.page);
						setRowsPerPage(e.rows);
					}}
				>
					<Column
						field="title"
						header="Title"
						sortable
						filter
						filterElement={idFilterTemplate}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						field="date"
						header="Date"
						sortable
						filter
						filterPlaceholder="Filter date"
						body={(row) => new Date(row.date).toLocaleDateString()}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						field="user.name"
						header="Request Owner"
						sortable
						filter
						filterElement={employeeFilterTemplate}
						body={(row) => row.user?.name}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						field="category"
						header="Category"
						sortable
						filter
						filterPlaceholder="Filter category"
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>

					<Column
						field="amount"
						header="Amount"
						sortable
						filter
						filterElement={amountFilterTemplate}
						body={(row) => `${row.currency} ${row.amount}`}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						header="Status"
						body={statusBadgeTemplate}
						sortable
						filter
						filterElement={statusFilterTemplate}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>

					<Column
						header="Uploaded Receipt"
						body={receiptBodyTemplate}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					{/* <Column
						header="Details"
						body={(row) => (
							<button
								onClick={() => openDetails(row)}
								className="text-indigo-600 hover:text-indigo-800"
							>
								<Eye className="w-5 h-5" />
							</button>
						)}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/> */}
					<Column
						header="Actions"
						body={actionsBody}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
				</DataTable>

				<Dialog
					header={
						<div className="flex items-center gap-2">
							{dialogType === 'approve' ? (
								<i className="pi pi-check-circle text-green-600 text-lg"></i>
							) : (
								<i className="pi pi-times-circle text-red-600 text-lg"></i>
							)}
							<span className="font-semibold">
								{dialogType === 'approve'
									? 'Confirm Approval'
									: 'Confirm Rejection'}
							</span>
						</div>
					}
					visible={dialogVisible}
					style={{ width: '600px' }}
					modal
					draggable={false}
					closable={false}
					dismissableMask={false}
					closeOnEscape={false}
					onHide={closeDialog}
					footer={dialogFooter}
				>
					{selectedRequest && (
						<div className="space-y-5">
							{/* Confirmation message */}
							<div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
								<p className="text-sm text-slate-700">
									Are you sure you want to{' '}
									<span
										className={`font-semibold ${
											dialogType === 'approve'
												? 'text-green-600'
												: 'text-red-600'
										}`}
									>
										{dialogType === 'approve' ? 'approve' : 'reject'}
									</span>{' '}
									request{' '}
									<span className="font-mono text-indigo-600">
										{selectedRequest.id}
									</span>{' '}
									submitted by{' '}
									<span className="font-semibold">
										{selectedRequest.employee}
									</span>
									?
								</p>
								<div className="mt-2 text-xs text-slate-500">
									Type: {selectedRequest.type} • Submitted:{' '}
									{selectedRequest.submittedDate}
								</div>
							</div>

							{/* Message input */}
							<div>
								<label className="text-sm font-medium text-slate-700">
									{dialogType === 'approve'
										? 'Approval Note '
										: 'Rejection Reason (required)'}
								</label>
								<InputTextarea
									rows={3}
									autoResize
									value={actionMessage}
									onChange={(e) => setActionMessage(e.target.value)}
									placeholder={
										dialogType === 'approve'
											? 'Add an optional approval note...'
											: 'State the reason for rejection...'
									}
									className={`w-full mt-2 ${
										dialogType === 'reject' && !actionMessage ? 'p-invalid' : ''
									}`}
								/>
								{dialogType === 'reject' && !actionMessage && (
									<small className="p-error">Rejection reason is required.</small>
								)}
							</div>
						</div>
					)}
				</Dialog>

				{/* Expense Details Dialog */}
				<Dialog
					header={<span className="font-semibold">Expense Details</span>}
					visible={detailsVisible}
					style={{ width: '60vw', maxWidth: '900px' }}
					modal
					draggable={false}
					onHide={() => setDetailsVisible(false)}
				>
					{activeExpense ? (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-xs text-gray-500">Title</div>
									<div className="font-medium">{activeExpense.title}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500">Date</div>
									<div>{new Date(activeExpense.date).toLocaleString()}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500">Employee</div>
									<div className="font-medium">{activeExpense.user?.name}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500">Category</div>
									<div>{activeExpense.category}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500">Paid By</div>
									<div>{activeExpense.paidBy?.name}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500">Amount</div>
									<div>
										{activeExpense.currency} {activeExpense.amount}
									</div>
								</div>
							</div>

							<div>
								<div className="text-xs text-gray-500">Description</div>
								<div className="mt-1">{activeExpense.description}</div>
							</div>

							<div>
								<div className="text-xs text-gray-500">Approver Decisions</div>
								<div className="mt-1 space-y-2">
									{activeExpense.approverDecisions?.map((d, i) => (
										<div key={i} className="p-2 border rounded">
											<div className="text-sm">
												<span className="font-medium">{d.userId}</span> —{' '}
												{d.status}
											</div>
											{d.comment && (
												<div className="text-xs text-slate-600 mt-1">
													{d.comment}
												</div>
											)}
											{d.decidedAt && (
												<div className="text-xs text-slate-400 mt-1">
													Decided at:{' '}
													{new Date(d.decidedAt).toLocaleString()}
												</div>
											)}
										</div>
									))}
								</div>
							</div>

							<div>
								<div className="text-xs text-gray-500">Receipt</div>
								<div className="mt-1">
									{activeExpense.receipt ? (
										<a
											href={activeExpense.receipt}
											target="_blank"
											rel="noreferrer"
											className="text-indigo-600 hover:underline"
										>
											Open Receipt
										</a>
									) : (
										<span className="text-slate-400 italic">No receipt</span>
									)}
								</div>
							</div>
						</div>
					) : (
						<p className="text-center text-slate-500">No expense selected</p>
					)}
				</Dialog>
			</div>
		</PageLayout>
	);
}
