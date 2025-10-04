import { createBrowserRouter, useParams } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
// import Registration from './pages/Producers/Registration';

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
	// {
	// 	path: '/producer',
	// 	errorElement: <ErrorElement />,
	// 	children: [
	// 		{ path: 'registration', element: <Registration /> },
	// 		{ path: 'dashboard', element: <ProducerDashboard /> },
	// 		{ path: 'subsidies', element: <MySubsidies /> },
	// 		{ path: 'milestone-form/:subsidyId', element: <MilestoneForm /> },
	// 		{ path: 'fetch-milestones/:id', element: <Milestones /> },
	// 	],
	// },
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
