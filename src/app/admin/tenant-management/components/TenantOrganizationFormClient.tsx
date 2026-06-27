'use client';

import { useRouter } from 'next/navigation';
import TenantOrganizationForm from '@/app/admin/tenant-management/components/TenantOrganizationForm';
import type { TenantOrganizationDTO, TenantOrganizationFormDTO } from '@/app/admin/tenant-management/types';

interface TenantOrganizationFormClientProps {
  initialData?: TenantOrganizationDTO;
  onSubmit: (data: TenantOrganizationFormDTO) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit';
  cancelHref?: string;
}

export default function TenantOrganizationFormClient({
  cancelHref = '/admin/tenant-management/organizations',
  ...props
}: TenantOrganizationFormClientProps) {
  const router = useRouter();

  return (
    <TenantOrganizationForm
      {...props}
      onCancel={() => {
        router.push(cancelHref);
      }}
    />
  );
}
