export interface PostalAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: 'US';
}

export interface SiteConfig {
  companyName: string;
  shortName: string;
  ownerName: string;
  phoneDisplay: string;
  phoneUri: string;
  faxDisplay: string;
  email: string;
  licenseNumber: string;
  licenseLabel: string;
  address: PostalAddress;
  establishedYear: number;
  serviceAreas: string[];
  socialLinks: { label: string; href: string }[];
  formBackendUrl?: string;
  defaultSeo: { title: string; description: string };
}

const configuredFormUrl = import.meta.env.PUBLIC_FORMBACKEND_URL?.trim();
const isFormBackendUrl = configuredFormUrl
  ? /^https:\/\/(?:www\.)?formbackend\.com\/f\/[A-Za-z0-9]+$/.test(configuredFormUrl)
  : false;

export const site: SiteConfig = {
  companyName: 'Hammer Heating and Air Conditioning',
  shortName: 'Hammer Heating & Air',
  ownerName: 'Bill Hammer',
  phoneDisplay: '(310) 371-4982',
  phoneUri: '+13103714982',
  faxDisplay: '(310) 542-5709',
  email: 'Bill@hammerheatingandair.com',
  licenseNumber: '679211',
  licenseLabel: 'LICENSE #679211',
  address: {
    streetAddress: '2230 Dufour Ave',
    addressLocality: 'Redondo Beach',
    addressRegion: 'CA',
    postalCode: '90278',
    addressCountry: 'US',
  },
  establishedYear: 1992,
  serviceAreas: ['South Bay'],
  socialLinks: [
    {
      label: 'Read reviews on Yelp',
      href: 'https://www.yelp.com/biz/hammer-heating-and-air-conditioning-redondo-beach-2',
    },
  ],
  formBackendUrl: isFormBackendUrl ? configuredFormUrl : undefined,
  defaultSeo: {
    title: 'Hammer Heating and Air Conditioning | South Bay HVAC',
    description:
      'Heating and air-conditioning installation and service from Bill Hammer, serving South Bay homes and businesses since 1992.',
  },
};

export const formatAddress = (address: PostalAddress): string =>
  `${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}`;
