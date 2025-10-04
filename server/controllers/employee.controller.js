const expenseModel = require('../models/expense.model');
const userModel = require('../models/user.model');
const approvalRuleModel = require('../models/approvalRule.model');
const Tesseract = require('tesseract.js');
const fs = require('fs');

async function addExpense(req, res) {
	const { title, date, category, paidBy, amount, currency, remarks, description } = req.body;
	const receipt = req.file ? req.file.path : null;
	const userId = res.locals.user._id; // Assuming user ID is stored in session

	if (!userId) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	if (!title || !date || !amount || !currency || !description) {
		return res.status(400).json({ message: 'Missing required fields' });
	}

	const hasPending = await expenseModel.exists({ userId, status: 'PENDING', isActive: true });

	const expense = new expenseModel({
		userId,
		title,
		date,
		category,
		paidBy,
		amount,
		currency,
		remarks,
		description,
		receipt: receipt.slice(6),
		status: hasPending ? 'DRAFT' : 'PENDING',
	});

	const rules = await approvalRuleModel.findOne({
		isActive: true,
		userId: res.locals.user._id,
	});

	expense.ruleId = rules ? rules._id : null;
	const approvers = [];
	if (rules.isManagerApproved) {
		approvers.push({ userId: rules.managerId, status: 'PENDING', isActive: true });
		rules.approvers.forEach((approver) => {
			approvers.push({ userId: approver.userId, status: 'PENDING', isActive: false });
		});
	} else {
		rules.approvers.forEach((approver, index) => {
			if (index === 0 && rules.isApproversSequential) {
				approvers.push({ userId: approver.userId, status: 'PENDING', isActive: true });
			} else if (!rules.isApproversSequential) {
				approvers.push({ userId: approver.userId, status: 'PENDING', isActive: true });
			} else {
				approvers.push({ userId: approver.userId, status: 'PENDING', isActive: false });
			}
		});
	}
	expense.approverDecisions = approvers;

	try {
		await expense.save();
		return res.status(201).json({ message: 'Expense added successfully', expense });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function addExpenseByOCR(req, res) {
	try {
		const userId = res.locals.user._id;
		if (!userId) return res.status(401).json({ message: 'Unauthorized' });

		const receiptPath = req.file ? req.file.path : null;
		if (!receiptPath) return res.status(400).json({ message: 'Receipt file is required' });

		const hasPending = await expenseModel.exists({ userId, status: 'PENDING', isActive: true });

		let ocrData = {};
		try {
			const result = await Tesseract.recognize(receiptPath, 'eng');
			const rawText = result.data.text || '';
			const lines = rawText
				.split(/\r?\n/)
				.map((l) => l.trim())
				.filter(Boolean);

			const moneyRegex =
				/(?:INR|₹|\$|USD|EUR|GBP|CAD|AUD)?\s*((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2}))/gi;

			let allAmounts = [];

			lines.forEach((line) => {
				let match;
				while ((match = moneyRegex.exec(line)) !== null) {
					const numericString = match[1].replace(/,/g, '');
					const value = parseFloat(numericString);
					if (!Number.isNaN(value)) {
						allAmounts.push({ value, line });
					}
				}
				moneyRegex.lastIndex = 0;
			});

			let finalAmount = 0;
			if (allAmounts.length) {
				finalAmount = allAmounts.reduce(
					(max, curr) => (curr.value > max ? curr.value : max),
					0
				);
			}
			const datePatterns = [
				/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/,
				/(\d{4}[\/\-]\d{2}[\/\-]\d{2})/,
				/(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)[a-z]*[.,]?\s+\d{4})/i,
				/([A-Za-z]+ \d{1,2},\s*\d{4})/,
				/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})/,
			];

			let parsedDate = null;
			for (const pattern of datePatterns) {
				const found = rawText.match(pattern);
				if (found && found[1]) {
					const d = new Date(found[1]);
					if (!isNaN(d.getTime())) {
						parsedDate = d;
						break;
					}
				}
			}
			const expenseDate = parsedDate || new Date();

			const merchantCandidate = lines.find((l) => !moneyRegex.test(l)) || 'Unknown Merchant';
			const description = lines.slice(0, 10).join(' | ').substring(0, 500);

			ocrData = {
				title: merchantCandidate,
				date: expenseDate,
				category: 'Others',
				paidBy: userId,
				amount: finalAmount || 0,
				currency: 'INR',
				remarks: 'Auto-generated from OCR',
				description: '-',
				receipt: receiptPath.slice(6),
				status: hasPending ? 'DRAFT' : 'PENDING',
			};
		} catch (error) {
			console.error('OCR Processing Failed:', error);
			return res.status(500).json({ message: 'Failed to process OCR', error: error.message });
		}

		const expense = new expenseModel({ userId, ...ocrData });
		await expense.save();

		return res.status(201).json({
			message: 'Expense added successfully via OCR',
			ocrExtracted: ocrData,
			expense,
		});
	} catch (err) {
		console.error('Error in submitByOCR:', err);
		return res.status(500).json({ message: 'Internal server error', error: err.message });
	}
}

async function fetchExpenses(req, res) {
	try {
		const companyId = res.locals.user.companyId;
		const userId = res.locals.user._id;

		const expenses = await expenseModel
			.find({ isActive: true, userId })
			.populate('paidBy', 'name')
			.sort({ createdAt: -1 });

		const formatted = expenses.map((e) => ({
			_id: e._id,
			title: e.title,
			date: e.date ? e.date.toISOString().split('T')[0] : '-',
			category: e.category || '-',
			amount: e.amount,
			currency: e.currency || 'USD',
			status: e.status.charAt(0).toUpperCase() + e.status.slice(1).toLowerCase(), // e.g. Approved
			paidBy: e.paidBy?.name || '-',
			remarks: e.remarks || '-',
		}));

		res.json({ success: true, data: formatted });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
	}
}

async function fetchInfo(req, res) {
	const userId = res.locals.user._id;
	const userDetails = await userModel.findOne({ _id: userId });
	const details = {
		name: userDetails.name,
		email: userDetails.email,
	};

	res.json({ data: details });
}

async function fetchExpenseById(req, res) {
	try {
		const { id } = req.params;

		const expense = await expenseModel
			.findById(id)
			.populate('userId', 'name email')
			.populate('paidBy', 'name email')
			.populate('approverDecisions.userId', 'name email');

		if (!expense) {
			return res.status(404).json({ success: false, message: 'Expense not found' });
		}

		res.json({ success: true, data: expense });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to fetch expense' });
	}
}

module.exports = {
	addExpense,
	addExpenseByOCR,
	fetchExpenses,
	fetchInfo,
	fetchExpenseById,
};
