import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import PageLayout from '../../components/layout/PageLayout';

export default function SubmitExpense() {
	const [formData, setFormData] = useState({
		title: '',
		date: null,
		category: null,
		paidBy: null,
		amount: '',
		currency: null,
		remarks: '',
		description: '',
		receipt: null,
	});
	const categories = [
		{ label: 'Travel', value: 'travel' },
		{ label: 'Food', value: 'food' },
	];
	const paidBy = [
		{ label: 'Romil', value: '64f1b7c123456789abcdef01' }, // real ObjectId from DB
		{ label: 'Dhruv', value: '64f1b7c123456789abcdef02' },
	];

	const currency = [
		{ label: 'Rupee(₹)', value: 'rupee' },
		{ label: 'Doller($)', value: 'doller' },
		{ label: 'Dirham(AED)', value: 'dirham' },
	];
	const currencies = [
		{ label: 'USD', value: 'USD' },
		{ label: 'INR', value: 'INR' },
	]; // Fetch from API

	const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
	const handleDropdown = (e, field) => setFormData({ ...formData, [field]: e.value });
	const handleSubmit = async () => {
		try {
			const payload = new FormData();

			Object.keys(formData).forEach((key) => {
				const value = formData[key];

				if (value === null || value === undefined) return;

				// Convert Date to ISO string
				if (value instanceof Date) {
					payload.append(key, value.toISOString());
				}
				// For file or strings
				else {
					payload.append(key, value);
				}
			});

			console.log(payload);
			const token = localStorage.getItem('token');
			const response = await fetch(`${import.meta.env.VITE_URL}employee/submit-expense`, {
				method: 'POST',
				body: payload,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();
			console.log('Expense submitted:', data);
			alert('Expense submitted successfully!');
		} catch (error) {
			console.error('Error submitting expense:', error);
			alert('Failed to submit expense.');
		}
	};

	const baseInputClasses =
		'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';
	const dropdownClases =
		'w-full rounded border border-gray-300 transition-all focus-within:shadow-none focus-within:ring-2 focus-within:ring-primary hover:border-primary';
	const btnClasses =
		'bg-primary text-white text-lg px-5 py-2 rounded hover:primary-hover font-semibold';

	return (
		<PageLayout>
			<div className="container p-5">
				<div className="flex items-center gap-1 mb-5">
					<h1 className="text-3xl font-bold text-primary">Submit Expense</h1>
				</div>
				<div className="px-10 py-5 bg-white border border-gray-300 rounded">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block mb-1 text-base font-medium text-text">
								Title
							</label>
							<InputText
								value={formData.title}
								name="title"
								onChange={handleChange}
								placeholder="Enter Title"
								className={`${baseInputClasses}`}
							/>
						</div>
						<div className="">
							<label className="block mb-1 text-base font-medium text-text">
								Expense Date
							</label>
							<Calendar
								value={formData.date}
								onChange={(e) => setFormData({ ...formData, date: e.value })}
								placeholder="Select Date"
								className="w-full"
							/>
						</div>
						<div>
							<label className="block mb-1 text-base font-medium text-text">
								Category
							</label>
							<Dropdown
								value={formData.category}
								options={categories}
								onChange={(e) => handleDropdown(e, 'category')}
								placeholder="Select Category"
								className={`${dropdownClases}`}
							/>
						</div>
						<div>
							<label className="block mb-1 text-base font-medium text-text">
								Paid By
							</label>
							<Dropdown
								value={formData.paidBy}
								options={paidBy}
								onChange={(e) => handleDropdown(e, 'paidBy')}
								filter
								placeholder="Select Paid by"
								className={`${dropdownClases}`}
							/>
						</div>
						<div>
							<label className="block mb-1 text-base font-medium text-text">
								Amount
							</label>
							<div className="p-inputgroup flex-1">
								<InputText
									name="amount"
									value={formData.amount}
									onChange={handleChange}
									placeholder="Enter Amount"
									className={`${baseInputClasses} rounded-r-none`}
								/>

								<span className="">
									<Dropdown
										value={formData.currency}
										options={currency}
										onChange={(e) => handleDropdown(e, 'currency')}
										filter
										placeholder="Select Currency"
										className={`${dropdownClases} rounded-l-none`}
									/>
								</span>
							</div>
						</div>
						<div className="">
							<label className="block mb-1 text-base font-medium text-text">
								Remakrs
							</label>
							<InputText
								id="remarks"
								name="remarks"
								value={formData.remarks}
								onChange={handleChange}
								placeholder="Enter Remarks"
								className={`${baseInputClasses}`}
							/>
						</div>
						<div className="">
							<label className="block mb-1 text-base font-medium text-text">
								Description
							</label>
							<InputTextarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={3}
								placeholder="Enter Description"
								className={`${baseInputClasses}`}
							/>
						</div>
					</div>
					<div className="mt-4">
						<label className="block mb-1 text-base font-medium text-text">
							Attachment
						</label>

						<div className="relative inline-block">
							<label
								htmlFor="receiptUpload"
								className={`cursor-pointer inline-flex items-center justify-center font-normal ${btnClasses}`}
							>
								Attach Receipt (OCR)
							</label>
							<input
								id="receiptUpload"
								type="file"
								name="receipt"
								accept="image/*"
								onChange={(e) =>
									setFormData({ ...formData, receipt: e.target.files[0] })
								}
								className="absolute inset-0 opacity-0 cursor-pointer"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-5">
						<Button
							label="Save Draft"
							outlined
							className={`w-auto border-primary text-primary text-lg font-medium hover:bg-primary/10`}
						/>
						<Button
							label="Submit"
							className={`w-40 ${btnClasses}`}
							onClick={handleSubmit}
						/>
					</div>
				</div>
			</div>
		</PageLayout>
	);
}
