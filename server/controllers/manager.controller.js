const expenseModel = require('../models/expense.model');

const getExpense = async (req, res) => {
	// const expenses
	const expenses = await expenseModel
		.find({ isActive: true })
		.populate('userId', '_id name email') // populate user details
		.populate('paidBy', '_id name') // populate paidBy details
		.populate('approverDecisions.userId', '_id name');

	// Map expenses to desired format
	const formattedExpenses = expenses.map((exp, index) => {
		return {
			_id: `EXP-${String(index + 1).padStart(3, '0')}`,
			title: exp.title,
			date: exp.date,
			user: exp.userId
				? { _id: exp.userId._id, name: exp.userId.name, email: exp.userId.email }
				: null,
			category: exp.category,
			paidBy: exp.paidBy ? { _id: exp.paidBy._id, name: exp.paidBy.name } : null,
			status: exp.status,
			approverDecisions: exp.approverDecisions
				.filter((ad) => ad.userId) // only include if userId exists
				.map((ad) => ({
					userId: ad.userId._id,
					status: ad.status,
					comment: ad.comment || '',
					decidedAt: ad.decidedAt || null,
				})),
			amount: exp.amount,
			currency: exp.currency,
			description: exp.description,
			receipt:
				exp.receipt ||
				`https://via.placeholder.com/800x600.png?text=Receipt+EXP-${String(
					index + 1
				).padStart(3, '0')}`,
		};
	});
	res.json({ data: formattedExpenses });
};

module.exports = {
	getExpense,
};
