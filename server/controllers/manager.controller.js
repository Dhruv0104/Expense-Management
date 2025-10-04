const expenseModel = require('../models/expense.model');
const userModel = require('../models/user.model');
const companyModel = require('../models/company.model');
const axios = require('axios');

// const fetch = require('node-fetch'); // make sure node-fetch is installed

const getExpense = async (req, res) => {
	try {
		const expenses = await expenseModel
			.find({ isActive: true })
			.populate('userId', '_id name email companyId') // include companyId
			.populate('paidBy', '_id name') // populate paidBy details
			.populate('approverDecisions.userId', '_id name');

		const formattedExpenses = [];

		for (let index = 0; index < expenses.length; index++) {
			const exp = expenses[index];

			// Default values
			let displayCurrency = exp.currency || 'USD';
			let convertedAmount = exp.amount || 0;

			// Fetch company currency
			if (exp.userId?.companyId) {
				const company = await companyModel.findById(exp.userId.companyId);
				if (company && company.defaultCurrency) {
					displayCurrency = company.defaultCurrency;

					// Convert if needed
					if (exp.currency && exp.currency !== displayCurrency) {
						try {
							const { data } = await axios.get(
								`https://api.exchangerate-api.com/v4/latest/${exp.currency}`
							);
							const rates = data.rates || {};
							if (rates[displayCurrency]) {
								convertedAmount = exp.amount * rates[displayCurrency];
							}
						} catch (err) {
							console.error('Currency conversion failed:', err.message);
						}
					}
				}
			}

			formattedExpenses.push({
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
					.filter((ad) => ad.userId)
					.map((ad) => ({
						userId: ad.userId._id,
						status: ad.status,
						comment: ad.comment || '',
						decidedAt: ad.decidedAt || null,
					})),
				amount: convertedAmount.toFixed(2),
				currency: displayCurrency,
				description: exp.description,
				receipt:
					exp.receipt ||
					`https://via.placeholder.com/800x600.png?text=Receipt+EXP-${String(
						index + 1
					).padStart(3, '0')}`,
			});
		}

		return res.json({ data: formattedExpenses });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to fetch expenses', error: err.message });
	}
};
const acceptRequest = async (req, res) => {
	const { requestId, status, comment } = req.body;
	const userId = res.locals.user._id;

	try {
		const expense = await expenseModel.findById(requestId);

		if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

		const approver = expense.approverDecisions.find(
			(a) => a.userId.toString() === userId.toString()
		);
		if (!approver)
			return res
				.status(400)
				.json({ success: false, message: 'You are not an approver for this request' });

		approver.status = status.toUpperCase();
		approver.comment = comment || '';
		approver.decidedAt = new Date();

		await expense.save();

		res.json({
			success: true,
			message: `Request successfully ${status.toLowerCase()}`,
			data: expense,
		});
	} catch (err) {
		console.error('Error in acceptRequest:', err);
		res.status(500).json({ success: false, message: 'Something went wrong' });
	}
};

const fetchInfo = async (req, res) => {
	const userId = res.locals.user._id;
	try {
		const userDetails = await userModel.findById(userId);
		const details = {
			name: userDetails.name,
			email: userDetails.email,
		};
		res.json({ data: details });
	} catch (err) {
		console.error('Error in fetchInfo:', err);
		res.status(500).json({ success: false, message: 'Something went wrong' });
	}
};

module.exports = {
	getExpense,
	acceptRequest,
	fetchInfo,
};
