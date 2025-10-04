import { createBrowserRouter, useParams } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
// import Registration from './pages/Producers/Registration';
import SubmitExpense from './pages/employee/SubmitExpense';

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
	// {
	// 	path: '/forgot-password',
	// 	loader: loginLoader,
	// 	element: <ForgotPassword />,
	// },
	{
		path: '/employee',
		errorElement: <ErrorElement />,
		children: [
			// { path: 'dashboard', element: <ProducerDashboard /> },
			{ path: 'submit-expense', element: <SubmitExpense /> },
		],
	},
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
