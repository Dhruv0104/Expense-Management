import React, { useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

// Dummy JSON Data
const dummyUsers = [
    { _id: 1, name: 'Alice Johnson', role: 'Manager', manager: '-', email: 'alice.johnson@example.com' },
    { _id: 2, name: 'Bob Smith', role: 'Manager', manager: 'Alice Johnson', email: 'bob.smith@example.com' },
    { _id: 3, name: 'Charlie Lee', role: 'Employee', manager: '-', email: 'charlie.lee@example.com' },
    { _id: 4, name: 'Dana White', role: 'Employee', manager: 'Charlie Lee', email: 'dana.white@example.com' },
    { _id: 5, name: 'Ethan Brown', role: 'Manager', manager: '-', email: 'ethan.brown@example.com' },
    { _id: 6, name: 'Fiona Green', role: 'Employee', manager: 'Alice Johnson', email: 'fiona.green@example.com' },
    { _id: 7, name: 'George King', role: 'Employee', manager: '-', email: 'george.king@example.com' },
];

function UserList() {
    const toast = useRef(null);
    const navigate = useNavigate();

    const roleOptions = [
        { label: 'Employee', value: 'Employee' },
        { label: 'Manager', value: 'Manager' },
    ];

    const [users, setUsers] = useState(dummyUsers);
    const [filters, setFilters] = useState({
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        role: { value: null, matchMode: FilterMatchMode.EQUALS },
        manager: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    // Update manager options dynamically based on current users
    const getManagerOptions = () =>
        users
            .filter((u) => u.role === 'Manager' || u.role === 'Director')
            .map((u) => ({ label: u.name, value: u.name }));

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        setFilters((prev) => ({
            ...prev,
            name: { value, matchMode: FilterMatchMode.CONTAINS },
            email: { value, matchMode: FilterMatchMode.CONTAINS },
            manager: { value, matchMode: FilterMatchMode.CONTAINS },
        }));
    };

    const roleFilterTemplate = (options) => (
        <Dropdown
            value={options.value}
            options={roleOptions}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            placeholder="Select Role"
            className="p-column-filter"
            showClear
        />
    );

    const clearFilters = () => {
        setFilters({
            name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            role: { value: null, matchMode: FilterMatchMode.EQUALS },
            manager: { value: null, matchMode: FilterMatchMode.CONTAINS },
            email: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue('');
    };

    const sendPasswordTemplate = (row) => (
        <Button
            label="Send Password"
            className="bg-primary text-white border-none px-3 py-1 rounded"
            onClick={() => {
                toast.current.show({
                    severity: 'success',
                    summary: 'Password Sent',
                    detail: `Password sent to ${row.email}`,
                });
            }}
        />
    );

    // Editor Templates
    const roleEditor = (options) => (
        <Dropdown
            value={options.value}
            options={roleOptions}
            onChange={(e) => {
                options.editorCallback(e.value);
                // optional: update state if you want immediate effect
                const updatedUsers = [...users];
                const index = updatedUsers.findIndex((u) => u._id === options.rowData._id);
                updatedUsers[index].role = e.value;
                setUsers(updatedUsers);
            }}
            className="w-full"
        />
    );

    const managerEditor = (options) => (
        <Dropdown
            value={options.value}
            options={getManagerOptions()}
            onChange={(e) => {
                options.editorCallback(e.value);
                const updatedUsers = [...users];
                const index = updatedUsers.findIndex((u) => u._id === options.rowData._id);
                updatedUsers[index].manager = e.value || '-';
                setUsers(updatedUsers);
            }}
            placeholder="-"
            className="w-full"
            showClear
        />
    );

    return (
        <PageLayout>
            <Toast ref={toast} />
            <div className="card p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-primary">User Management</h2>
                    <div className="flex gap-2">
                        <Button
                            label="Add User"
                            icon="pi pi-user-plus"
                            className="bg-primary text-white text-lg font-medium px-3 py-2 rounded hover:bg-primary-hover"
                            onClick={() => navigate(`/admin/add-user`)}
                        />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search users"
                            className="w-60"
                        />
                        <Button
                            icon="pi pi-filter-slash"
                            rounded
                            outlined
                            onClick={clearFilters}
                            className="text-primary border-primary"
                            tooltip="Clear filter"
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>
                <DataTable
                    value={users}
                    dataKey="_id"
                    filters={filters}
                    filterDisplay="menu"
                    onFilter={(e) => setFilters(e.filters)}
                    globalFilterFields={['name', 'role', 'manager', 'email']}
                    emptyMessage="No users found."
                    tableStyle={{ borderCollapse: 'collapse' }}
                    className="p-datatable-sm min-w-[700px]"
                    stripedRows
                    paginator
                    rows={10}
                    editMode="cell"
                >
                    <Column
                        field="name"
                        header="User"
                        sortable
                        filter
                        filterPlaceholder="Search Name"
                        bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
                        headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
                    />
                    <Column
                        field="role"
                        header="Role"
                        sortable
                        filter
                        showFilterMatchModes={false}
                        filterElement={roleFilterTemplate}
                        editor={roleEditor}
                        bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
                        headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
                    />
                    <Column
                        field="manager"
                        header="Manager"
                        sortable
                        filter
                        editor={managerEditor}
                        filterPlaceholder="Search Manager"
                        bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
                        headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
                    />
                    <Column
                        field="email"
                        header="Email"
                        sortable
                        filter
                        filterPlaceholder="Search Email"
                        bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
                        headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
                    />
                    <Column
                        header="Send Password"
                        body={sendPasswordTemplate}
                        bodyClassName="text-center border border-gray-300 px-3 py-2"
                        headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
                    />
                </DataTable>
            </div>
        </PageLayout>
    );
}

export default UserList;
