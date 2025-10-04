const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		defaultCurrency: { type: String, required: true }, // e.g. "INR", "USD"
		country: { type: String },
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

const companyModel = mongoose.model('companies', companySchema);
module.exports = companyModel;
