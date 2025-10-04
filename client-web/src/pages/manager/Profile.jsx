import { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';
import { RotateCcwKey } from 'lucide-react';
import image from '../../assets/profile.png';

export default function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [profile, setProfile] = useState({
		name: '',
		email: '',
		profile: { url: image },
	});
	const [tempProfile, setTempProfile] = useState({ ...profile });
	const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const toast = useRef(null);
	const token = localStorage.getItem('token');

	useEffect(() => {
		async function loadProfile() {
			const response = await fetchGet({ pathName: 'manager/profile', token });
			const updatedProfile = {
				...profile,
				name: response.data.name,
				email: response.data.email,
				profile: { url: response.data.profile?.url || image },
			};
			setProfile(updatedProfile);
			setTempProfile(updatedProfile);
		}
		loadProfile();
	}, []);

	const handleEdit = () => setIsEditing(true);
	const handleCancel = () => {
		setTempProfile({ ...profile });
		setIsEditing(false);
	};
	const handleInputChange = (field, value) => {
		setTempProfile({ ...tempProfile, [field]: value });
	};
	const onUpload = (event) => {
		const file = event.files[0];
		setTempProfile({ ...tempProfile, profile: { url: file.objectURL, file } });
	};

	const handleSave = async () => {
		const formData = new FormData();
		formData.append('name', tempProfile.name.trim());
		formData.append('email', tempProfile.email.trim());
		if (tempProfile.profile.file) formData.append('profile', tempProfile.profile.file);

		const response = await fetch(import.meta.env.VITE_URL + 'user/profile', {
			method: 'POST',
			body: formData,
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await response.json();
		if (data.success) {
			setProfile(tempProfile);
			setIsEditing(false);
			toast.current.show({
				severity: 'success',
				summary: 'Profile Updated',
				detail: 'Changes saved!',
			});
		} else {
			toast.current.show({
				severity: 'error',
				summary: 'Failed',
				detail: data.message || 'Update failed',
			});
		}
	};

	const handlePasswordChange = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.current.show({
				severity: 'warn',
				summary: 'Missing Fields',
				detail: 'Please fill all password fields',
			});
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.current.show({
				severity: 'error',
				summary: 'Mismatch',
				detail: 'Passwords do not match',
			});
			return;
		}
		setLoading(true);
		try {
			const userId = localStorage.getItem('_id');
			const response = await fetchPost({
				pathName: 'auth/change-password',
				body: JSON.stringify({ userId, currentPassword, newPassword }),
			});
			if (response.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Password Changed',
					detail: 'Your password has been updated.',
				});
				setPasswordDialogVisible(false);
				setCurrentPassword('');
				setNewPassword('');
				setConfirmPassword('');
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Failed',
					detail: response.message || 'Could not change password',
				});
			}
		} catch (error) {
			console.error(error);
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'An error occurred while changing password',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<PageLayout>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
				<Toast ref={toast} />
				<Card className="mx-auto max-w-4xl rounded-2xl border-none shadow-xl">
					<div className="flex justify-end px-6 pt-6">
						<Button
							label="Change Password"
							icon={<RotateCcwKey />}
							className="gap-2 bg-info border-0"
							onClick={() => setPasswordDialogVisible(true)}
						/>
					</div>

					<div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-10">
						<div className="text-center">
							<Avatar
								image={tempProfile.profile.url}
								className="border-4 border-blue-200 size-52 mx-auto"
								shape="circle"
							/>
							{isEditing && (
								<FileUpload
									mode="basic"
									accept="image/*"
									maxFileSize={1000000}
									onSelect={onUpload}
									chooseLabel="Upload"
									className="mt-3"
								/>
							)}
							<h3 className="mt-6 font-bold text-2xl text-dark-primary">
								{profile.name}
							</h3>
						</div>

						<div className="col-span-2">
							<div className="flex justify-between items-center mb-6 border-b-2 border-blue-300 pb-2">
								<h2 className="text-2xl font-semibold text-primary">
									Profile Information
								</h2>
								<div>
									{isEditing ? (
										<>
											<Button
												icon="pi pi-check"
												rounded
												text
												className="text-success border-1 border-success"
												onClick={handleSave}
											/>
											<Button
												icon="pi pi-times"
												rounded
												text
												className="text-error border-1 border-error ml-2"
												onClick={handleCancel}
											/>
										</>
									) : (
										<Button
											icon="pi pi-pencil"
											rounded
											text
											className="text-primary border-1 border-primary"
											onClick={handleEdit}
										/>
									)}
								</div>
							</div>

							<div className="flex flex-col gap-6">
								{['name', 'email'].map((field) => (
									<div key={field} className="flex flex-col">
										<label className="text-lg font-medium capitalize text-primary mb-2">
											{field}
										</label>
										{isEditing ? (
											<InputText
												value={tempProfile[field]}
												onChange={(e) =>
													handleInputChange(field, e.target.value)
												}
											/>
										) : (
											<p className="p-2 bg-blue-50 rounded-md text-md text-blue-900">
												{profile[field]}
											</p>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</Card>

				<Dialog
					header="Change Password"
					visible={passwordDialogVisible}
					style={{ width: '30vw' }}
					modal
					onHide={() => setPasswordDialogVisible(false)}
				>
					<div className="flex flex-col gap-4">
						<label className="font-medium">Current Password</label>
						<InputText
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
						<label className="font-medium">New Password</label>
						<InputText
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<label className="font-medium">Confirm New Password</label>
						<InputText
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						<Button
							label="Update Password"
							icon="pi pi-check"
							loading={loading}
							onClick={handlePasswordChange}
							className="bg-success border-success"
						/>
					</div>
				</Dialog>
			</div>
		</PageLayout>
	);
}
