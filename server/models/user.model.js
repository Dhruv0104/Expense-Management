const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		companyId: { type: mongoose.SchemaTypes.ObjectId, ref: 'companies', required: true },
		name: { type: String },
		email: { type: String, required: true, lowercase: true, index: true },
		password: { type: String }, // required for local auth
		role: { type: String, enum: ['Admin', 'Manager', 'Employee'] },
		isManager: { type: Boolean, default: false },
		managerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' }, // immediate manager
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
