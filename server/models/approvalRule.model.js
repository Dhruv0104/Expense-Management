const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
		description: { type: String, required: true },
		managerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
		isManagerApproved: { type: Boolean, default: false },
		approvers: [
			{
				userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
				isRequired: { type: Boolean, default: false },
				isSpecific: { type: Boolean, default: false },
			},
		],
		type: { type: String, enum: ['PERCENTAGE', 'SPECIFIC', 'HYBRID'], required: true },
		isApproversSequential: { type: Boolean, default: false },
		minimumApprovalsPercentage: { type: Number, default: 100 },
		isActive: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	}
);

const approvalRuleModel = mongoose.model('approvalrules', approvalRuleSchema);
module.exports = approvalRuleModel;
