import type { ReactNode } from 'react';

import MainHeader from '../navigation/MainHeader';
import MainFooter from './MainFooter';

type MainLayoutProps = {
  children: ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='main-layout'>
      <MainHeader />

      <main className='main-layout__content'>{children}</main>

      <MainFooter />
    </div>
  );
}

export default MainLayout;
