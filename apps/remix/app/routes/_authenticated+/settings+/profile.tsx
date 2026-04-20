import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { trpc } from '@documenso/trpc/react';
import { AnimateGenericFadeInOut } from '@documenso/ui/components/animate/animate-generic-fade-in-out';

import { AccountDeleteDialog } from '~/components/dialogs/account-delete-dialog';
import { AvatarImageForm } from '~/components/forms/avatar-image';
import { ProfileForm } from '~/components/forms/profile';
import { SettingsHeader } from '~/components/general/settings-header';
import { TeamEmailUsage } from '~/components/general/teams/team-email-usage';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Profile`);
}

export default function SettingsProfile() {
  const { _ } = useLingui();
  const { organisations, user } = useSession();
  const [searchParams] = useSearchParams();

  const { data: teamEmail } = trpc.team.email.get.useQuery();

  const isPersonalLayoutMode = isPersonalLayout(organisations);
  const isSimplifiedProfileRoute = searchParams.get('simplified')?.toLowerCase() === 'true';

  if (isSimplifiedProfileRoute) {
    return (
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            <Trans>Update profile</Trans>
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            <Trans>Update your full name and default signature.</Trans>
          </p>
        </div>

        <ProfileForm className="max-w-xl" />
      </div>
    );
  }

  return (
    <div>
      <SettingsHeader
        title={_(msg`Profile`)}
        subtitle={_(msg`Here you can edit your personal details.`)}
      />

      <AvatarImageForm className="mb-8 max-w-xl" />
      <ProfileForm className="mb-8 max-w-xl" />

      <hr className="my-4 max-w-xl" />

      <div className="max-w-xl space-y-8">
        <AnimatePresence>
          {(!isPersonalLayoutMode || user.email !== teamEmail?.email) && teamEmail && (
            <AnimateGenericFadeInOut>
              <TeamEmailUsage teamEmail={teamEmail} />
            </AnimateGenericFadeInOut>
          )}
        </AnimatePresence>

        <AccountDeleteDialog />
      </div>
    </div>
  );
}
