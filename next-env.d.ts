/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
/// <reference types="next" />

declare namespace NodeJS {
  interface ProcessEnv {
    DEEPSEEK_API_KEY: string;
  }
}