import { createBrowserRouter, useParams } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SubmitExpense from './pages/employee/SubmitExpense';
import ExpenseLog from './pages/manager/ExpenseLog';
import ExpensesHistory from './pages/employee/ExpensesHistory';
import UserList from './pages/admin/UserList';
import AddUser from './pages/admin/AddUser';
import ApprovalRules from './pages/admin/ApprovalRules';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeDashbaord from './pages/employee/Dashboard';
import ProfilePage from './pages/manager/Profile';
import EmployeeProfilePage from './pages/employee/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveTracking from './pages/employee/LiveTracking';

const routes = createBrowserRouter([
	{
		path: '/',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/login',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/register',
		// loader: loginLoader,
		element: <Register />,
	},
	// {
	// 	path: '/forgot-password',
	// 	loader: loginLoader,
	// 	element: <ForgotPassword />,
	// },

	{
		path: '/admin',
		// loader: verifyLoader('admin'),
		// errorElement: <ErrorElement />,
		children: [
			{ path: 'dashboard', element: <AdminDashboard /> },
			{ path: 'users', element: <UserList /> },
			{ path: 'add-user', element: <AddUser /> },
			{ path: 'approval-rules', element: <ApprovalRules /> },
		],
	},
	{
		path: '/manager',
		children: [
			{
				path: 'dashboard',
				element: <ManagerDashboard />,
			},
			{
				path: 'expense-log',
				element: <ExpenseLog />,
			},
			{
				path: 'profile',
				element: <ProfilePage />,
			},
		],
	},
	{
		path: '/employee',
		errorElement: <ErrorElement />,
		children: [
			{ path: 'dashboard', element: <EmployeeDashbaord /> },
			{ path: 'submit-expense', element: <SubmitExpense /> },
			{ path: 'expenses-history', element: <ExpensesHistory /> },
			{ path: 'profile', element: <EmployeeProfilePage /> },
			{ path: 'tracking/:id', element: <LiveTracking /> }
		],
	},
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
