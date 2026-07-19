/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FORMBACKEND_URL?: string;
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
