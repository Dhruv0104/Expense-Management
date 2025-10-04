const jwt = require('jsonwebtoken');
const md5 = require('md5');
const userModel = require('../models/user.model');
// const companyModel = require('../models/company.model');
const { sendResetPasswordEmail } = require('../utils/mailer');
const approvalRuleModel = require('../models/approvalRule.model');

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

module.exports = { addUser, fetchManagers, fetchEmployees, addRules };
