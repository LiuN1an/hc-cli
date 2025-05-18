export interface LOCAL_ENV {
	LOCAL_DB: string;
	CLOUDFLARE_ACCOUNT_ID: string;
	CLOUDFLARE_DATABASE_ID: string;
	CLOUDFLARE_D1_TOKEN: string;
}

declare global {
	namespace NodeJS {
		interface ProcessEnv extends LOCAL_ENV {}
	}
}

export {};
