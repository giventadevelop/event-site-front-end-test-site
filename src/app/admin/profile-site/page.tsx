import ProfileSiteAdminClient from './ProfileSiteAdminClient';
import {
  fetchPublicProfileServer,
  fetchProfileWritingsServer,
  fetchProfileAchievementsServer,
  fetchProfileAffiliationsServer,
  fetchProfileMediaAssetsServer,
} from './ApiServerActions';

export default async function ProfileSiteAdminPage() {
  const [profile, writings, achievements, affiliations, assets] = await Promise.all([
    fetchPublicProfileServer(),
    fetchProfileWritingsServer(false),
    fetchProfileAchievementsServer(),
    fetchProfileAffiliationsServer(),
    fetchProfileMediaAssetsServer(),
  ]);

  return (
    <ProfileSiteAdminClient
      initialProfile={profile}
      initialWritings={writings}
      initialAchievements={achievements}
      initialAffiliations={affiliations}
      initialAssets={assets}
    />
  );
}
