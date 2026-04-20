import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Outlet, useSearchParams } from 'react-router';

import { SettingsDesktopNav } from '~/components/general/settings-nav-desktop';
import { SettingsMobileNav } from '~/components/general/settings-nav-mobile';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags(msg`Settings`);
}

export default function SettingsLayout() {
  const [searchParams] = useSearchParams();
  const isSimplifiedProfileRoute = searchParams.get('simplified')?.toLowerCase() === 'true';

  if (isSimplifiedProfileRoute) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8 md:py-12">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <h1 className="text-4xl font-semibold">
        <Trans>Settings</Trans>
      </h1>

      <div className="mt-4 grid grid-cols-12 gap-x-8 md:mt-8">
        <SettingsDesktopNav className="hidden md:col-span-3 md:flex" />
        <SettingsMobileNav className="col-span-12 mb-8 md:hidden" />

        <div className="col-span-12 md:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
