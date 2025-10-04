// ...existing code...
import React, { useEffect, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide, Eye } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

const initialRequests = [
	{
		id: 'REQ-001',
		employee: 'Sarah Johnson',
		type: 'Travel',
		submittedDate: '2025-09-20',
		status: 'Pending',
		message: '',
	},
	{
		id: 'REQ-002',
		employee: 'Mark Lee',
		type: 'Food',
		submittedDate: '2025-09-18',
		status: 'Pending',
		message: '',
	},
	{
		id: 'REQ-003',
		employee: 'Anita Gomez',
		type: 'Supplies',
		submittedDate: '2025-09-15',
		status: 'Approved',
		message: 'Approved as per budget policy',
	},
	{
		id: 'REQ-004',
		employee: 'John Doe',
		type: 'Training',
		submittedDate: '2025-09-12',
		status: 'Rejected',
		message: 'Not aligned with current training plan',
	},
];

export default function ExpenseLog() {
	const [requests, setRequests] = useState(initialRequests);
	const [filters, setFilters] = useState({
		id: { value: null, matchMode: FilterMatchMode.CONTAINS },
		employee: { value: null, matchMode: FilterMatchMode.CONTAINS },
		type: { value: null, matchMode: FilterMatchMode.CONTAINS },
		submittedDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
	});
	const [globalFilterValue, setGlobalFilterValue] = useState('');
	const [currentPage, setCurrentPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(false);
	const toast = useRef(null);

	// Approve / Reject dialog state
	const [dialogVisible, setDialogVisible] = useState(false);
	const [dialogType, setDialogType] = useState(null); // 'approve' | 'reject'
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [actionMessage, setActionMessage] = useState('');

	useEffect(() => {
		// If you later want to fetch real data, do it here.
	}, []);

	const onGlobalFilterChange = (e) => {
		const value = e.target.value;
		setGlobalFilterValue(value);
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
		setActionMessage(''); // reset message
		setDialogVisible(true);
	};

	const updateStatus = (id, newStatus, message) => {
		setRequests((prev) =>
			prev.map((r) => (r.id === id ? { ...r, status: newStatus, message } : r))
		);

		toast.current?.show({
			severity: 'success',
			summary: `${newStatus}`,
			detail: `Request ${id} marked as ${newStatus}. ${message ? `Note: ${message}` : ''}`,
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
		const isPending = rowData.status === 'Pending';
		const badgeColor =
			rowData.status.toLowerCase() === 'approved'
				? 'bg-green-100 text-green-800'
				: rowData.status.toLowerCase() === 'rejected'
				? 'bg-red-100 text-red-800'
				: rowData.status.toLowerCase() === 'pending'
				? 'bg-yellow-100 text-yellow-800'
				: 'bg-gray-100 text-gray-800';
		return (
			<div className="flex items-center gap-2">
				{isPending ? (
					<>
						<Button
							label="Approve"
							icon="pi pi-check"
							className="p-button-sm p-button shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
							onClick={() => openConfirm(rowData, 'approve')}
							style={{
								background: '#16a34a',
								border: 'none',
								color: 'white',
							}}
						/>

						<Button
							label="Reject"
							icon="pi pi-times"
							className="p-button-sm p-button shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
							onClick={() => openConfirm(rowData, 'reject')}
							style={{
								background: '#dc2626',
								border: 'none',
								color: 'white',
							}}
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
		const status = (rowData?.status || 'Unknown').toLowerCase();
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
					dataKey="id"
					loading={loading}
					filters={filters}
					globalFilter={globalFilterValue}
					filterDisplay="menu"
					onFilter={(e) => setFilters(e.filters)}
					globalFilterFields={['id', 'employee', 'type', 'submittedDate']}
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
						field="id"
						header="Request ID"
						sortable
						filter
						filterElement={idFilterTemplate}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						field="employee"
						header="Employee Name"
						sortable
						filter
						filterElement={employeeFilterTemplate}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						field="type"
						header="Type"
						sortable
						filter
						filterPlaceholder="Filter type"
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						field="submittedDate"
						header="Submitted Date"
						sortable
						filter
						filterPlaceholder="Filter date"
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
					<Column
						header="Status"
						body={statusBadgeTemplate}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName={`bg-primary text-white text-md font-semibold border border-gray-200 `}
					/>
					<Column
						field="message"
						header="Note"
						body={(rowData) => (
							<span className="text-xs text-slate-600">{rowData.message || '-'}</span>
						)}
						bodyClassName="text-sm border border-gray-200 px-3 py-2"
						headerClassName="bg-primary text-white text-md font-semibold border border-gray-200"
					/>
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
			</div>
		</PageLayout>
	);
}
