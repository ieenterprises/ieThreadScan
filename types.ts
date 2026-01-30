
export type ScanConfig = {
  connectionStandard: string;
  connectionGender: string;
  connectionType: string;
  threadCategory: string;
  threadType: string;
  product: string;
  frameCount: number;
};

export type Finding = {
  frameIndex: number;
  defectType: string;
  description: string;
  severity: "Low" | "Medium" | "High";
};

export type AnalysisResult = {
  summary: string;
  classification: {
    predictedThreadType: string;
    confidence: number;
  };
  dimensions: {
    pitch_mm: number;
    crestWidth_mm: number;
    rootWidth_mm: number;
  };
  findings: Finding[];
};

export type SavedScan = {
  id: string;
  timestamp: number;
  config: ScanConfig;
  result: AnalysisResult;
  thumbnail: string;
};

export enum Step {
  CONFIGURE = 1,
  CAPTURE = 2,
  REVIEW = 3,
  REPORT = 4
}

export enum AppView {
  SCANNER = 'scanner',
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  SETTINGS = 'settings'
}
