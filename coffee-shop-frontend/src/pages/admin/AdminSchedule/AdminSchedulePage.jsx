import { Outlet } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AdminSchedulePage() {
  useDocumentTitle('Lịch làm việc | Admin');
  return <Outlet />;
}
