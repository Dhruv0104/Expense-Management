const expenseModel = require('../models/expense.model');

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

module.exports = {
	addExpense,
};
