export type NpmDailyDownloads = {
  downloads: number;
  day: string;
};

export type NpmRangeData = {
  downloads: NpmDailyDownloads[];
  start: string;
  end: string;
  package: string;
};
