export type LogType = 'log' | 'warn' | 'error' | 'info';

export interface LogEntry {
    type: LogType;
    args: any[];
    time: Date;
}

export interface NetworkRequest {
    id: string;
    method: string;
    type: 'fetch' | 'xhr';
    url: string;
    fullUrl: string;
    params: Record<string, string>;
    reqHeaders: Record<string, string>;
    resHeaders: Record<string, string>;
    status: number | string;
    _start: number;
    duration: number;
    reqBody: any;
    resBody: any;
}

export interface ThemeConfig {
    primary?: string;
    background?: string;
    text?: string;
}

export interface TriggerConfig {
    text?: string;
    color?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface ConsoleConfig {
    maxLogs?: number;
    theme?: ThemeConfig;
    trigger?: TriggerConfig;
}

export interface StoreState {
    logs: LogEntry[];
    reqs: Record<string, NetworkRequest>;
    fps: number;
    isOpen: boolean;
    activeTab: string;
    searchQuery: string;
}
