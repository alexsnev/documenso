import type { Signer } from '@libpdf/core';
import type { PDF } from '@libpdf/core';
import { match } from 'ts-pattern';

import {
  NEXT_PRIVATE_USE_LEGACY_SIGNING_SUBFILTER,
  NEXT_PUBLIC_SIGNING_CONTACT_INFO,
  NEXT_PUBLIC_WEBAPP_URL,
} from '@documenso/lib/constants/app';
import { env } from '@documenso/lib/utils/env';

import { getTimestampAuthority } from './helpers/tsa';
import { createGoogleCloudSigner } from './transports/google-cloud';
import { createLocalSigner } from './transports/local';

export type SignOptions = {
  pdf: PDF;
};

let signer: Signer | null = null;

const getTransport = (): string => env('NEXT_PRIVATE_SIGNING_TRANSPORT') || 'local';

const getSigner = async (): Promise<Signer | null> => {
  if (signer) {
    return signer;
  }

  const transport = getTransport();

  if (transport === 'none') {
    return null;
  }

  signer = await match(transport)
    .with('local', async () => await createLocalSigner())
    .with('gcloud-hsm', async () => await createGoogleCloudSigner())
    .otherwise(() => {
      throw new Error(`Unsupported signing transport: ${transport}`);
    });

  return signer;
};

export const signPdf = async ({ pdf }: SignOptions) => {
  const transport = getTransport();

  if (transport === 'none') {
    return await pdf.save();
  }

  const activeSigner = await getSigner();

  if (!activeSigner) {
    return await pdf.save();
  }

  const tsa = getTimestampAuthority();

  const { bytes } = await pdf.sign({
    signer: activeSigner,
    reason: 'Signed by Documenso',
    location: NEXT_PUBLIC_WEBAPP_URL(),
    contactInfo: NEXT_PUBLIC_SIGNING_CONTACT_INFO(),
    subFilter: NEXT_PRIVATE_USE_LEGACY_SIGNING_SUBFILTER()
      ? 'adbe.pkcs7.detached'
      : 'ETSI.CAdES.detached',
    timestampAuthority: tsa ?? undefined,
    longTermValidation: !!tsa,
    archivalTimestamp: !!tsa,
  });

  return bytes;
};