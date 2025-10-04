import React, { useRef, useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet, fetchPost } from '../../utils/fetch.utils';

function UserList() {
    const toast = useRef(null);
    const navigate = useNavigate();

    const roleOptions = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Employee', value: 'Employee' },
        { label: 'Manager', value: 'Manager' },
    ];

    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);

    const [filters, setFilters] = useState({
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        role: { value: null, matchMode: FilterMatchMode.EQUALS },
        manager: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetchGet({ pathName: 'admin/fetch-users' });
            if (res?.success) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await fetchGet({ pathName: 'admin/fetch-managers' });
            if (res?.success) {
                const options = res.data.map((m) => ({
                    label: m.name,
                    value: m._id,
                }));
                setManagers(options);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchManagers();
    }, []);

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

    const roleEditor = (options) => (
        <Dropdown
            value={options.value}
            options={roleOptions}
            onChange={async (e) => {
                options.editorCallback(e.value);

                await fetchPost({
                    pathName: `admin/update-user/${options.rowData._id}`,
                    body: JSON.stringify({ role: e.value }),
                });

                // Refresh users after update
                fetchUsers();
            }}
            className="w-full"
        />
    );


    const managerEditor = (options) => (
        <Dropdown
            value={options.rowData.managerId || null}
            options={managers}
            onChange={async (e) => {
                const newManagerId = e.value;

                // Update UI immediately
                const updatedUsers = users.map((u) =>
                    u._id === options.rowData._id
                        ? {
                            ...u,
                            managerId: newManagerId,
                            manager:
                                managers.find((m) => m.value === newManagerId)?.label || '-',
                        }
                        : u
                );
                setUsers(updatedUsers);

                // Update backend
                await fetchPost({
                    pathName: `admin/update-user/${options.rowData._id}`,
                    body: JSON.stringify({ managerId: newManagerId }),
                });

                // Sync DataTable cell
                options.editorCallback(newManagerId);
            }}
            placeholder="-"
            className="w-full"
            showClear
        />
    );


    const sendCredentialsTemplate = (row) => (
        <Button
            label="Send Credentials"
            className="bg-primary text-white border-none px-3 py-1 rounded"
            onClick={async () => {
                await fetchPost({
                    pathName: `admin/send-credentials/${row._id}`,
                });
                toast.current.show({
                    severity: 'success',
                    summary: 'Credentials Sent',
                    detail: `Credentials sent to ${row.email}`,
                });
            }}
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
                        field="managerId"
                        header="Manager"
                        sortable
                        filter
                        showFilterMatchModes={false}
                        filterPlaceholder="Search Manager"
                        editor={managerEditor}
                        body={(row) => row.manager || '-'} // display manager name
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
                        header="Send Credentials"
                        body={sendCredentialsTemplate}
                        bodyClassName="text-center border border-gray-300 px-3 py-2"
                        headerClassName="bg-primary-border text-white text-lg font-semibold border border-gray-300"
                    />
                </DataTable>
            </div>
        </PageLayout>
    );
}

export default UserList;
