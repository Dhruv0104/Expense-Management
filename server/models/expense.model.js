const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
		ruleId: { type: mongoose.SchemaTypes.ObjectId, ref: 'approvalrules' },
		title: { type: String, required: true },
		date: { type: Date, required: true },
		category: { type: String },
		paidBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
		currency: { type: String, required: true }, // e.g. "INR", "USD"
		amount: { type: Number, required: true },
		description: { type: String, required: true },
		status: {
			type: String,
			enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
			default: 'PENDING',
		},
		receipt: { type: String },
		approverDecisions: [
			{
				userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users', required: true },
				status: {
					type: String,
					enum: ['PENDING', 'APPROVED', 'REJECTED'],
					default: 'PENDING',
				},
				comment: { type: String },
				decidedAt: { type: Date },
			},
		],
		startedAt: { type: Date, default: Date.now },
		completedAt: { type: Date },
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

const expenseModel = mongoose.model('expenses', expenseSchema);
module.exports = expenseModel;
