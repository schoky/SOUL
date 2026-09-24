import {
	BrowserRouter,
	Route,
	Routes
} from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

import HomePage
	from '../pages/Home/HomePage';

import LoginPage
	from '../pages/Login/LoginPage';

import RegisterPage
	from '../pages/Register/RegisterPage';

function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<PublicRoute />}>
					<Route
						path="/login"
						element={<LoginPage />}
					/>
				</Route>
				
				<Route
					path="/register"
					element={<RegisterPage />}
				/>
				
				<Route element={<ProtectedRoute />}>
					<Route
						path="/"
						element={<HomePage />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default AppRouter;