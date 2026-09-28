import type {
	ReactNode
} from 'react';

import MainHeader
	from '../navigation/MainHeader';

type MainLayoutProps = {
	children: ReactNode;
};

function MainLayout({
	                    children
                    }: MainLayoutProps) {
	return (
		<div className="main-layout">
			<MainHeader />
			
			<main className="main-layout__content">
				{children}
			</main>
		</div>
	);
}

export default MainLayout;