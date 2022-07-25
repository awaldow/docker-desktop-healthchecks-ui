export interface ContainerHealthCheckInfo {
    Name: string;
    ID: string;
    ContainerStatus: string;
    Status: string | null;
    FailingStreak: number | null;
    Log: Array<HealthCheckEntry> | [];
}

export interface HealthCheckEntry {
    Start: Date;
    End: Date;
    ExitCode: number;
    Output: string;
}