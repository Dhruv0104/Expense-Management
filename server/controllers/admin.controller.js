const jwt = require('jsonwebtoken');
const md5 = require('md5');
const userModel = require('../models/user.model');
// const companyModel = require('../models/company.model');
const { sendResetPasswordEmail } = require('../utils/mailer');

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

module.exports = { addUser };
