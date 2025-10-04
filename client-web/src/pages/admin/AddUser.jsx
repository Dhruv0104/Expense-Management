import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import PageLayout from '../../components/layout/PageLayout';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPost } from '../../utils/fetch.utils';

// Dummy manager list
const managerList = [
    { label: 'Alice Johnson', value: 'Alice Johnson' },
    { label: 'Ethan Brown', value: 'Ethan Brown' },
    { label: 'Charlie Lee', value: 'Charlie Lee' },
];

const roleOptions = [
    { label: 'Manager', value: 'Manager' },
    { label: 'Employee', value: 'Employee' },
];

function AddUser() {
    const toast = useRef(null);
    const navigate = useNavigate();
    const baseInputClasses =
        'w-full p-2 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-primary hover:border-primary';
    const dropdownClases =
        'w-full rounded border border-gray-300 transition-all focus-within:shadow-none focus-within:ring-2 focus-within:ring-primary hover:border-primary';
    const btnClasses =
        'bg-primary text-white text-xl px-5 py-2 rounded hover:bg-primary-hover font-semibold';

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        manager: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (e, field) => {
        setFormData((prev) => ({ ...prev, [field]: e.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here you can call your API to save user
        console.log('Form submitted:', formData);
        setLoading(true);
        try {
            const response = await fetchPost({
                pathName: 'admin/add-user',
                body: JSON.stringify(formData),
            });

            if (response?.success) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'User added successfully',
                });
                setTimeout(() => {
                    navigate('/admin/users'); // Redirect to dashboard/home after signup
                }, 2000);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: `${response?.message || 'Registration failed'}`,
                });
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong!',
            });
        } finally {
            setLoading(false);
        }

        // Reset form
        setFormData({ name: '', role: '', manager: '', email: '' });
    };

    return (
        <PageLayout>
            <Toast ref={toast} />
            <div className="card p-5">
                <div className="flex items-center gap-0 mb-5">
                    <Button
                        icon={<i className="pi pi-angle-left text-3xl text-primary" />}
                        rounded
                        text
                        aria-label="Back"
                        className="focus:outline-none focus:ring-0 my-auto"
                        onClick={() => navigate(-1)}
                    />
                    <h2 className="text-2xl lg:text-3xl font-bold text-primary my-auto">
                        Add New User
                    </h2>
                </div>
                <div className="w-full overflow-x-hidden px-3">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* User Name */}
                        <div>
                            <label className="block mb-1 text-base font-medium text-text">
                                User Name
                            </label>
                            <InputText
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter User Name"
                                className={baseInputClasses}
                            />
                        </div>

                        {/* User Role */}
                        <div>
                            <label className="block mb-1 text-base font-medium text-text">
                                Role
                            </label>
                            <Dropdown
                                value={formData.role}
                                options={roleOptions}
                                onChange={(e) => handleDropdownChange(e, 'role')}
                                placeholder="Select Role"
                                className={dropdownClases}
                            />
                        </div>

                        {/* User's Manager */}
                        <div>
                            <label className="block mb-1 text-base font-medium text-text">
                                Manager
                            </label>
                            <Dropdown
                                value={formData.manager}
                                options={managerList}
                                onChange={(e) => handleDropdownChange(e, 'manager')}
                                placeholder="Select Manager"
                                className={dropdownClases}
                            />
                        </div>

                        {/* User Email */}
                        <div>
                            <label className="block mb-1 text-base font-medium text-text">
                                Email
                            </label>
                            <InputText
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter User Email"
                                className={baseInputClasses}
                            />
                        </div>

                        <div className="text-right mt-4">
                            <Button type="submit" label="Add User" className={btnClasses} />
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
}

export default AddUser;
