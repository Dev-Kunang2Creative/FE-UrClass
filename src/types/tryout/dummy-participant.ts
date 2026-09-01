export type DummyScorePreset = "normal" | "competitive" | "random";

export type ParticipantTypeFilter = "all" | "real" | "dummy";

export interface DummyParticipantSummary {
  total_participants: number;
  real_participants: number;
  dummy_participants: number;
}

export interface DummyParticipantMutationResponse {
  message: string;
  count: number;
}

export interface InjectDummyRandomPayload {
  id: string;
  token: string;
  count: number;
  scorePreset: DummyScorePreset;
}

export interface InjectDummyExcelPayload {
  id: string;
  token: string;
  file: File;
}

export interface DummyParticipantTryoutPayload {
  id: string;
  token: string;
}
