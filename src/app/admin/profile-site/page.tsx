import ProfileSiteAdminClient from './ProfileSiteAdminClient';
import {
  fetchPublicProfileServer,
  fetchProfileWritingsServer,
  fetchProfileAchievementsServer,
  fetchProfileAffiliationsServer,
  fetchProfileMediaAssetsServer,
  fetchProfileProjectsServer,
} from './ApiServerActions';

export default async function ProfileSiteAdminPage() {
  const [profile, writings, achievements, affiliations, assets, projects] = await Promise.all([
    fetchPublicProfileServer(),
    fetchProfileWritingsServer(false),
    fetchProfileAchievementsServer(),
    fetchProfileAffiliationsServer(),
    fetchProfileMediaAssetsServer(),
    fetchProfileProjectsServer(),
  ]);

  return (
    <ProfileSiteAdminClient
      initialProfile={profile}
      initialWritings={writings}
      initialAchievements={achievements}
      initialAffiliations={affiliations}
      initialAssets={assets}
      initialProjects={projects}
    />
  );
}
