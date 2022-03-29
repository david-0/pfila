const providers: any[] = [
  {provide: "environment", useValue: "Production"},
  {provide: "baseUrl", useValue: "/api"}
];

export const ENV_PROVIDERS = providers;

export const environment = {
  production: true
};
