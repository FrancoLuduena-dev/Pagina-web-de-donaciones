// TEST_DESCOMENTAR
/* 
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  return <>{children}</>;
} */

// END_TEST_DESCOMENTAR

//MOCK_BORRAR
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

//END_MOCK_BORRAR