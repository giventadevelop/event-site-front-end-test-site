import { safeAuth } from '@/lib/safe-auth';
import { fetchPromotionEmailTemplateServer } from '../ApiServerActions';
import PromotionEmailTemplateEditClient from './PromotionEmailTemplateEditClient';

export default async function PromotionEmailTemplateEditPage(
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  const { params } = props;
  const { userId } = await safeAuth();

  if (!userId) {
    return <div>You must be logged in to view this page.</div>;
  }

  // Handle params for Next.js 15+ compatibility
  let templateId: string;
  if (typeof params.then === 'function') {
    const resolvedParams = await params;
    templateId = resolvedParams.id;
  } else {
    templateId = params.id;
  }

  const template = await fetchPromotionEmailTemplateServer(Number(templateId));

  return (
    <PromotionEmailTemplateEditClient
      template={template}
      templateId={Number(templateId)}
    />
  );
}







