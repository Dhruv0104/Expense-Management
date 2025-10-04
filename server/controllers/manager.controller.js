const expenseModel = require('../models/expense.model');
const userModel = require('../models/user.model');

const getExpense = async (req, res) => {
	// const expenses
	const expenses = await expenseModel
		.find({
			isActive: true,
			approverDecisions: { $elemMatch: { userId: res.locals.user._id } },
		})
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
			status: exp.approverDecisions.find((ad) =>
				ad.userId ? ad.userId._id.toString() === res.locals.user._id.toString() : false
			)?.status,
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
	const expense = await expenseModel.findById(requestId).populate('ruleId');
	const approver = expense.approverDecisions.find(
		(a) => a.userId.toString() === userId.toString()
	);
	console.log('approver', approver);
	approver.status = 'APPROVED';
	approver.comment = comment || '';
	approver.decidedAt = new Date();

	const rule = expense.ruleId;

	const totalApprovers = expense.approverDecisions.length;
	const approvedCount = expense.approverDecisions.filter((a) => a.status === 'APPROVED').length;
	const rejectedCount = expense.approverDecisions.filter((a) => a.status === 'REJECTED').length;

	let finalDecision = null;

	// 1. If specific approver approves → auto approve
	if (
		rule.specificApprover &&
		approver.userId.toString() === rule.specificApprover.toString() &&
		approver.status === 'APPROVED'
	) {
		finalDecision = 'APPROVED';
	}

	// 2. If percentage rule applies
	if (!finalDecision && rule.percentageRule) {
		const percentApproved = (approvedCount / totalApprovers) * 100;
		if (percentApproved >= rule.percentageRule) {
			finalDecision = 'APPROVED';
		}
	}

	// 3. Hybrid Rule → Either condition works
	if (!finalDecision && rule.hybrid) {
		const percentApproved = (approvedCount / totalApprovers) * 100;
		if (
			(rule.specificApprover &&
				approver.userId.toString() === rule.specificApprover.toString() &&
				approver.status === 'APPROVED') ||
			percentApproved >= rule.percentageRule
		) {
			finalDecision = 'APPROVED';
		}
	}

	const matchedRule = rule.approvers.find((r) => r.userId.toString() === userId.toString());
	if (matchedRule && matchedRule.isRequired && status === 'REJECTED') {
		finalDecision = 'REJECTED';
	}

	// 4. If any approver REJECTS → reject immediately
	// if (!finalDecision && rejectedCount > 0) {
	// 	finalDecision = 'REJECTED';
	// }

	// === DECISION OR MOVE TO NEXT APPROVER ===
	if (finalDecision) {
		expense.status = finalDecision;
		expense.completedAt = new Date();
	} else {
		// not final yet → activate next approver if sequential
		if (rule.isApproversSequential) {
			const approversList = expense.approverDecisions;
			const currentIndex = approversList.findIndex(
				(a) => a.userId.toString() === userId.toString()
			);
			if (currentIndex !== -1 && currentIndex + 1 < approversList.length) {
				approversList[currentIndex + 1].isActive = true;
			}
		}
		// if NOT sequential → multiple approvers can be active together
		else {
			// all still pending ones remain active
			expense.approverDecisions.forEach((a) => {
				if (a.status === 'PENDING') a.isActive = true;
			});
		}
	}

	await expense.save();

	res.json({
		success: true,
		message: `Request successfully`,
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
