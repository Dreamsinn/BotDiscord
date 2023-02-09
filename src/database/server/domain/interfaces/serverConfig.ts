export interface ServerConfigOptions {
    prefix?: string;
    adminRole?: string;
    blackList?: string[];
}

export interface ServerConfig {
    prefix: string;
    adminRole: string;
    blackList: string[];
}
