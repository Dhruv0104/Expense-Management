const expenseModel = require('../models/expense.model');
const userModel = require('../models/user.model');

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
			_id: exp._id,
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

const acceptRequest = async (req, res) => {
	const { requestId, status, comment } = req.body;
	const userId = res.locals.user._id;
	console.log(userId);
	const expense = await expenseModel.findById(requestId);
	const approver = expense.approverDecisions.find((a) => a.userId === userId);
	console.log('approver', approver);
	approver.status = status;
	approver.comment = comment || '';
	approver.decidedAt = new Date();
	await expense.save();

	res.json({
		success: true,
		message: `Request successfully ${action}d`,
		data: expense,
	});
};

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
	getExpense,
	acceptRequest,
	fetchInfo,
};
