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
import AddUsers from './pages/admin/AddUsers';
import ApprovalRules from './pages/admin/ApprovalRules';
import ManagerDashboard from './pages/manager/ManagerDashboard';

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
			// { path: 'dashboard', element: <AdminDashboard /> },
			{ path: 'user-list', element: <UserList /> },
			{ path: 'add-user', element: <AddUsers /> },
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
		],
	},
	{
		path: '/employee',
		errorElement: <ErrorElement />,
		children: [
			// { path: 'dashboard', element: <ProducerDashboard /> },
			{ path: 'submit-expense', element: <SubmitExpense /> },
			{ path: 'expenses-history', element: <ExpensesHistory /> },
		],
	},
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
