const expenseModel = require('../models/expense.model');
const userModel = require('../models/user.model');

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
	});

	try {
		await expense.save();
		return res.status(201).json({ message: 'Expense added successfully', expense });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function fetchExpenses(req, res) {
	try {
		const companyId = res.locals.user.companyId;
		const userId = res.locals.user._id;

		// Fetch all expenses by user's company (or limit to user if required)
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
			remarks: e.description || '-',
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

module.exports = {
	addExpense,
	fetchExpenses,
	fetchInfo,
};
