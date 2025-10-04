import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';

function ApprovalRules() {
	const baseInputClasses =
		'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';
	const dropdownClasses =
		'w-full rounded border border-gray-300 transition-all focus-within:shadow-none focus-within:ring-2 focus-within:ring-primary hover:border-primary';
	const btnClasses =
		'bg-primary text-white text-xl px-5 py-2 rounded hover:bg-primary-hover font-semibold';

	const [userOptions, setUserOptions] = useState([]);
	const [managerOptions, setManagerOptions] = useState([]);
	const [users, setUsers] = useState([]);
	const [managers, setManagers] = useState([]);

	const [formData, setFormData] = useState({
		user: '',
		manager: '',
		isManagerApprover: false,
		ruleDescription: '',
		approvers: [],
		newApprover: null,
		approvalType: 'percentage', // 'percentage', 'specific', 'hybrid'
		minimumApprovalPercentage: 0,
		approvesInSequence: false,
	});

	// Fetch dropdown data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const users = await fetchGet({ pathName: 'admin/fetch-employees' });
				const managers = await fetchGet({ pathName: 'admin/fetch-managers' });

				// Ensure data matches Dropdown format { label, value }
				setUsers(users.data);
				setManagers(managers.data);
				setUserOptions(users.data.map((u) => ({ label: u.name, value: u._id })));
				setManagerOptions(managers.data.map((m) => ({ label: m.name, value: m._id })));
			} catch (error) {
				console.error('Error fetching dropdown data:', error);
			}
		};

		fetchData();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === 'approvalType') {
			// Reset approver checkboxes based on new type
			const newApprovers = formData.approvers.map((a) => {
				if (value === 'percentage') {
					return { ...a, specific: false }; // disable specific
				} else if (value === 'specific') {
					return { ...a, required: false }; // disable required
				}
				return a; // hybrid - keep as is
			});

			setFormData((prev) => ({
				...prev,
				approvalType: value,
				approvers: newApprovers,
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleCheckboxChange = (e, field) => {
		setFormData((prev) => ({ ...prev, [field]: e.checked }));
	};

	const handleAddApprover = () => {
		if (!formData.newApprover) return;

		if (formData.approvers.some((a) => a.value === formData.newApprover.value)) return;

		setFormData((prev) => ({
			...prev,
			approvers: [
				...prev.approvers,
				{ ...formData.newApprover, specific: false, required: false },
			],
			newApprover: null,
		}));
	};

	const handleApproverFieldChange = (index, field, value) => {
		const newApprovers = [...formData.approvers];
		newApprovers[index][field] = value;
		setFormData((prev) => ({ ...prev, approvers: newApprovers }));
	};

	const handleDragEnd = (result) => {
		if (!result.destination) return;
		const items = Array.from(formData.approvers);
		const [reordered] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reordered);
		setFormData((prev) => ({ ...prev, approvers: items }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await fetchPost({
				pathName: 'admin/add-rules',
				body: JSON.stringify(formData),
			});
			console.log('Saved:', data);
			alert('Rule saved successfully!');
		} catch (error) {
			console.error('Error saving rule:', error);
		}
	};

	const handleUserChange = (userId) => {
		setFormData((prev) => ({ ...prev, user: userId }));

		const selectedUser = users.find((u) => u._id === userId);
		console.log('Selected User: ', selectedUser);
		if (selectedUser && selectedUser.managerId) {
			setFormData((prev) => ({
				...prev,
				user: userId,
				manager: selectedUser.managerId, // auto set manager
			}));
		}
	};

	return (
		<PageLayout>
			<div className="card p-5 max-w-4xl mx-auto space-y-6">
				<h2 className="text-3xl font-bold text-primary">Approval Rules</h2>

				{/* User */}
				<div>
					<label className="block mb-1 text-base font-medium text-text">User</label>
					<Dropdown
						value={formData.user}
						options={userOptions}
						onChange={(e) => handleUserChange(e.value)}
						placeholder="Select User"
						className={dropdownClasses}
					/>
				</div>

				{/* Manager + Checkbox */}
				<div className="flex gap-4 items-center">
					<div className="flex-1">
						<label className="block mb-1 text-base font-medium text-text">
							Manager
						</label>
						<Dropdown
							value={formData.manager}
							options={managerOptions}
							onChange={(e) =>
								handleChange({ target: { name: 'manager', value: e.value } })
							}
							placeholder="Select Manager"
							className={dropdownClasses}
						/>
					</div>
					<div className="flex items-center gap-2 mt-6">
						<Checkbox
							inputId="isManagerApprover"
							checked={formData.isManagerApprover}
							onChange={(e) => handleCheckboxChange(e, 'isManagerApprover')}
						/>
						<label
							htmlFor="isManagerApprover"
							className="text-primary font-semibold fs-xl"
						>
							Is Manager an Approver?
						</label>
					</div>
				</div>

				{/* Rule Description */}
				<div>
					<label className="block mb-1 text-base font-medium text-text">
						Description about rules
					</label>
					<InputText
						name="ruleDescription"
						value={formData.ruleDescription}
						onChange={handleChange}
						placeholder="Approval rule for ..."
						className={baseInputClasses}
					/>
				</div>

				{/* Approval Type Radio Buttons */}
				<div className="flex gap-6 items-center mt-2">
					{['percentage', 'specific', 'hybrid'].map((type) => (
						<div className="flex items-center gap-2" key={type}>
							<RadioButton
								inputId={type}
								name="approvalType"
								value={type}
								checked={formData.approvalType === type}
								onChange={(e) =>
									handleChange({
										target: { name: 'approvalType', value: e.value },
									})
								}
							/>
							<label htmlFor={type}>
								{type === 'percentage'
									? 'Percentage Based'
									: type === 'specific'
									? 'Specific Approver Based'
									: 'Hybrid'}
							</label>
						</div>
					))}
				</div>

				{/* Add Approvers */}
				<div className="flex gap-2 items-center mt-4">
					<Dropdown
						value={formData.newApprover}
						options={[...managerOptions]}
						optionLabel="label"
						optionValue={(option) => option} // use full object
						onChange={(e) => setFormData((prev) => ({ ...prev, newApprover: e.value }))}
						placeholder="Select Approver"
						className="flex-1 rounded border border-gray-300 p-2"
					/>
					<Button
						label="Add Approver"
						className={btnClasses}
						onClick={handleAddApprover}
					/>
				</div>

				{/* Approvers Table with Drag & Drop */}
				{formData.approvers.length > 0 && (
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="approvers">
							{(provided) => (
								<div
									className="mt-4 border border-gray-300 rounded overflow-hidden"
									ref={provided.innerRef}
									{...provided.droppableProps}
								>
									{/* Table Header */}
									<div className="grid grid-cols-4 bg-gray-100 font-semibold p-2 border-b border-gray-300">
										<div className="text-center">Sr No.</div> {/* Order No */}
										<div>Approver</div>
										<div className="text-center">Specific Approver</div>
										<div className="text-center">Required</div>
									</div>

									{/* Table Rows */}
									{formData.approvers.map((approver, index) => (
										<Draggable
											key={approver.value}
											draggableId={approver.value}
											index={index}
										>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													className={`grid grid-cols-4 items-center p-2 border-b border-gray-200 hover:bg-gray-50 ${
														snapshot.isDragging ? 'bg-blue-100' : ''
													}`}
												>
													<div className="text-center">{index + 1}</div>{' '}
													{/* Order No */}
													<div>{approver.label}</div>
													<div className="flex justify-center">
														<Checkbox
															checked={approver.specific}
															disabled={
																formData.approvalType ===
																'percentage'
															}
															onChange={(e) =>
																handleApproverFieldChange(
																	index,
																	'specific',
																	e.checked
																)
															}
														/>
													</div>
													<div className="flex justify-center">
														<Checkbox
															checked={approver.required}
															disabled={
																formData.approvalType === 'specific'
															}
															onChange={(e) =>
																handleApproverFieldChange(
																	index,
																	'required',
																	e.checked
																)
															}
														/>
													</div>
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				)}

				{/* Minimum Approval Percentage */}
				{formData.approvalType !== 'specific' && (
					<div>
						<label className="block mb-1 text-base font-medium text-text">
							Minimum Approval Percentage
						</label>
						<InputNumber
							value={formData.minimumApprovalPercentage}
							onValueChange={(e) =>
								setFormData((prev) => ({
									...prev,
									minimumApprovalPercentage: e.value,
								}))
							}
							className={baseInputClasses}
							suffix="%"
							min={0}
							max={100}
						/>
					</div>
				)}

				{/* Approves in Sequence */}
				<div className="flex items-center gap-2 mt-4">
					<Checkbox
						inputId="approvesInSequence"
						checked={formData.approvesInSequence}
						onChange={(e) => handleCheckboxChange(e, 'approvesInSequence')}
					/>
					<label htmlFor="approvesInSequence">Approves in Sequence</label>
				</div>

				{/* Submit */}
				<div className="text-right mt-4">
					<Button
						type="submit"
						label="Save Rule"
						className={btnClasses}
						onClick={handleSubmit}
					/>
				</div>
			</div>
		</PageLayout>
	);
}

export default ApprovalRules;
