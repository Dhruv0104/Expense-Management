const jwt = require('jsonwebtoken');
const md5 = require('md5');
const userModel = require('../models/user.model');
// const companyModel = require('../models/company.model');
const { sendResetPasswordEmail, sendPassword } = require('../utils/mailer');
const approvalRuleModel = require('../models/approvalRule.model');
const expenseModel = require('../models/expense.model');

async function addUser(req, res) {
	const { name, role, manager, email } = req.body;

	// Validate required fields
	if (!name || !role || !email) {
		return res
			.status(400)
			.json({ success: false, message: 'Name, role, and email are required' });
	}

	// Check if user already exists
	const existingUser = await userModel.findOne({ email: email.toLowerCase() });
	if (existingUser) {
		return res.status(400).json({ success: false, message: 'User already exists' });
	}

	// Create new user
	const newUser = new userModel({
		companyId: res.locals.user.companyId,
		name,
		email: email.toLowerCase(),
		password: md5('123'), // Default password
		role,
		managerId: manager || null, // Optional manager
		isManager: role === 'Manager' ? true : false,
	});

	await newUser.save();

	res.status(201).json({
		success: true,
		message: 'User added successfully',
	});
}

// Fetch Managers
async function fetchManagers(req, res) {
	try {
		const managers = await userModel.find({
			role: 'Manager',
			isActive: true,
			companyId: res.locals.user.companyId,
		});
		res.json({ success: true, data: managers });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to fetch managers' });
	}
}

async function fetchEmployees(req, res) {
	try {
		const employees = await userModel.find({
			role: 'Employee',
			isActive: true,
			companyId: res.locals.user.companyId,
		});
		res.json({ success: true, data: employees });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to fetch managers' });
	}
}

//Fetch Users
async function fetchUsers(req, res) {
	try {
		const companyId = res.locals.user.companyId;

		const users = await userModel
			.find({ companyId, isActive: true })
			.populate('managerId', 'name')
			.select('_id name email role managerId');

		const formatted = users.map((u) => ({
			_id: u._id,
			name: u.name,
			email: u.email,
			role: u.role,
			managerId: u.managerId?._id || null,
			manager: u.managerId?.name || '-',
		}));

		res.json({ success: true, data: formatted });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to fetch users' });
	}
}

// Update User (role or manager)
async function updateUser(req, res) {
	try {
		const { id } = req.params;
		const { role, managerId } = req.body;

		const updateData = {};
		if (role) {
			updateData.role = role;
			updateData.isManager = role === 'Manager';
		}
		if (managerId !== undefined) {
			updateData.managerId = managerId || null;
		}

		await userModel.findByIdAndUpdate(id, updateData);
		res.json({ success: true, message: 'User updated successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to update user' });
	}
}

// Send Password
async function sendCredentials(req, res) {
	try {
		const { id } = req.params;
		const user = await userModel.findById(id);
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		const tempPassword = Math.random().toString(36).slice(-8);
		user.password = md5(tempPassword);
		await user.save();

		await sendPassword(user.email, user.name, tempPassword);

		res.json({ success: true, message: `Password sent to ${user.email}` });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to send password' });
	}
}

async function addRules(req, res) {
	try {
		const {
			user,
			manager,
			isManagerApprover,
			ruleDescription,
			approvers,
			approvalType,
			minimumApprovalPercentage,
			approvesInSequence,
		} = req.body;

		// Map approvers array into schema-compatible format
		const approversData = approvers.map((a) => ({
			userId: a.value, // value is the userId from dropdown
			isRequired: a.required || false,
			isSpecific: a.specific || false,
		}));

		const newRule = new approvalRuleModel({
			userId: user,
			managerId: manager,
			isManagerApproved: isManagerApprover,
			description: ruleDescription,
			approvers: approversData,
			type: approvalType.toUpperCase(), // 'percentage' → 'PERCENTAGE'
			isApproversSequential: approvesInSequence,
			minimumApprovalsPercentage: minimumApprovalPercentage,
		});

		await newRule.save();

		res.status(201).json({
			success: true,
			message: 'Approval Rule created successfully',
			data: newRule,
		});
	} catch (error) {
		console.error('Error creating approval rule:', error);
		res.status(500).json({
			success: false,
			message: 'Error creating approval rule',
			error: error.message,
		});
	}
}

async function getDashboardStats(req, res) {
	try {
		const companyId = res.locals.user.companyId;

		const totalUsers = await userModel.countDocuments({ companyId, isActive: true });
		const totalManagers = await userModel.countDocuments({
			companyId,
			role: 'Manager',
			isActive: true,
		});
		const totalEmployees = await userModel.countDocuments({
			companyId,
			role: 'Employee',
			isActive: true,
		});

		const totalPendingRequests = await expenseModel.countDocuments({
			userId: { $in: await userModel.find({ companyId }).distinct('_id') },
			status: 'PENDING',
			isActive: true,
		});

		const totalApprovedRequests = await expenseModel.countDocuments({
			userId: { $in: await userModel.find({ companyId }).distinct('_id') },
			status: 'APPROVED',
			isActive: true,
		});

		const totalRejectedRequests = await expenseModel.countDocuments({
			userId: { $in: await userModel.find({ companyId }).distinct('_id') },
			status: 'REJECTED',
			isActive: true,
		});

		const totalExpenseData = await expenseModel.aggregate([
			{
				$match: {
					status: 'APPROVED',
					isActive: true,
					userId: { $in: await userModel.find({ companyId }).distinct('_id') },
				},
			},
			{ $group: { _id: null, total: { $sum: '$amount' } } },
		]);

		const totalExpense = totalExpenseData[0]?.total || 0;

		res.json({
			success: true,
			data: {
				totalUsers,
				totalManagers,
				totalEmployees,
				totalPendingRequests,
				totalApprovedRequests,
				totalRejectedRequests,
				totalExpense,
			},
		});
	} catch (err) {
		console.error('Dashboard stats error:', err);
		res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
	}
}

// Fetch All Expenses (Requests)
async function fetchExpenses(req, res) {
	try {
		const companyId = res.locals.user.companyId;
		const expenses = await expenseModel
			.find({ companyId, isActive: true })
			.populate('userId', 'name email')
			.sort({ createdAt: -1 });
		res.json({ success: true, data: expenses });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
	}
}

module.exports = {
	addUser,
	fetchManagers,
	fetchEmployees,
	addRules,
	fetchUsers,
	updateUser,
	sendCredentials,
	getDashboardStats,
	fetchExpenses,
};
