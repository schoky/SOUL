import type { ReactNode } from 'react';

import SoulLogo from '../branding/SoulLogo';

type AuthLayoutProps = {
  children: ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className='auth-layout'>
      <SoulLogo className='auth-layout__logo' />

      <div className='auth-layout__content'>{children}</div>
    </main>
  );
}

export default AuthLayout;
