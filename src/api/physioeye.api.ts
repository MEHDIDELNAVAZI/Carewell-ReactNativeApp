import api from './client';

/**
 * ============================================================
 * API ROUTE
 * ============================================================
 */

const PHYSIOEYE_BASE_ROUTE = 'physioeyetests/';

/**
 * ============================================================
 * Common Types
 * ============================================================
 */

export interface PhysioProgressItem {
  session_id: number;
  date: string | null;
  average: number | null;
}

/**
 * ============================================================
 * OVERVIEW
 * ============================================================
 *
 * GET physioeyetests/overview/
 *
 * Actual backend response:
 *
 * {
 *   "overview": {
 *     "average": 44,
 *     "latest": {
 *       "posture": 35,
 *       "alignment": 44,
 *       "upper_body": 64,
 *       "lower_body": 67,
 *       "functional_movement": 29,
 *       "walking": 22
 *     },
 *     "progress": [
 *       {
 *         "session_id": 30,
 *         "date": "...",
 *         "average": 50
 *       },
 *       {
 *         "session_id": 31,
 *         "date": "...",
 *         "average": 44
 *       }
 *     ]
 *   }
 * }
 *
 * ============================================================
 */

export interface PhysioOverviewLatest {
  posture: number | null;
  alignment: number | null;
  upper_body: number | null;
  lower_body: number | null;
  functional_movement: number | null;
  walking: number | null;
}

export interface PhysioOverviewProgressItem {
  session_id: number;
  date: string | null;
  average: number | null;
}

export interface PhysioOverviewData {
  average: number;
  latest: PhysioOverviewLatest;
  progress: PhysioOverviewProgressItem[];
}

export interface PhysioOverviewResponse {
  overview: PhysioOverviewData;
}

/**
 * ============================================================
 * POSTURE
 * ============================================================
 */

export interface PostureLatest {
  head: number | null;
  shoulder: number | null;
  upper_back: number | null;
  lower_back: number | null;
}

export interface PostureData {
  average: number | null;
  latest: PostureLatest;
  progress: PhysioProgressItem[];
}

export interface PostureResponse {
  posture: PostureData;
}

/**
 * ============================================================
 * ALIGNMENT
 * ============================================================
 */

export interface AlignmentLatest {
  pelvic: number | null;
  shoulder: number | null;
  knee: number | null;
}

export interface AlignmentData {
  average: number | null;
  latest: AlignmentLatest;
  progress: PhysioProgressItem[];
}

export interface AlignmentResponse {
  alignment: AlignmentData;
}

/**
 * ============================================================
 * UPPER BODY
 * ============================================================
 */

export interface UpperBodyLatest {
  shoulder: number | null;
  elbow: number | null;
  wrist: number | null;
}

export interface UpperBodyData {
  average: number | null;
  latest: UpperBodyLatest;
  progress: PhysioProgressItem[];
}

export interface UpperBodyResponse {
  upper_body: UpperBodyData;
}

/**
 * ============================================================
 * LOWER BODY
 * ============================================================
 */

export interface LowerBodyLatest {
  hip: number | null;
  ankle: number | null;
  knee: number | null;
}

export interface LowerBodyData {
  average: number | null;
  latest: LowerBodyLatest;
  progress: PhysioProgressItem[];
}

export interface LowerBodyResponse {
  lower_body: LowerBodyData;
}

/**
 * ============================================================
 * FUNCTIONAL MOVEMENT
 * ============================================================
 */

export interface FunctionalMovementLatest {
  reach_balance: number | null;
  flexibility: number | null;
  movement_control: number | null;
}

export interface FunctionalMovementData {
  average: number | null;
  latest: FunctionalMovementLatest;
  progress: PhysioProgressItem[];
}

export interface FunctionalMovementResponse {
  functional_movement: FunctionalMovementData;
}

/**
 * ============================================================
 * WALKING
 * ============================================================
 */

export interface WalkingLatest {
  walking_symmetry: number | null;
  step_consistency: number | null;
  fall_risk: number | null;
}

export interface WalkingData {
  average: number | null;
  latest: WalkingLatest;
  progress: PhysioProgressItem[];
}

export interface WalkingResponse {
  walking: WalkingData;
}

/**
 * ============================================================
 * METRIC
 * ============================================================
 */

export type PhysioMetric =
  | 'posture'
  | 'alignment'
  | 'upper_body'
  | 'lower_body'
  | 'functional_movement'
  | 'walking';

/**
 * ============================================================
 * API REQUESTS
 * ============================================================
 *
 * Every request uses:
 *
 * physioeyetests/
 *
 * Routes:
 *
 * physioeyetests/overview/
 * physioeyetests/posture/
 * physioeyetests/alignment/
 * physioeyetests/uperbody/
 * physioeyetests/lowerbody/
 * physioeyetests/functionalmovement/
 * physioeyetests/walking/
 *
 * The existing `api` client handles authentication/token.
 *
 * ============================================================
 */

/**
 * ============================================================
 * OVERVIEW
 * ============================================================
 *
 * GET physioeyetests/overview/
 *
 * Used by PhysioScreen.
 *
 * ============================================================
 */

export const getPhysioOverview = async (): Promise<PhysioOverviewResponse> => {
  const response = await api.get<PhysioOverviewResponse>(
    `${PHYSIOEYE_BASE_ROUTE}overview/`,
  );

  console.log(
    'getPhysioOverview RESPONSE:',
    JSON.stringify(response.data, null, 2),
  );

  return response.data;
};

/**
 * ============================================================
 * POSTURE
 * ============================================================
 *
 * GET physioeyetests/posture/
 *
 * ============================================================
 */

export const getPosture = async (): Promise<PostureResponse> => {
  const response = await api.get<PostureResponse>(
    `${PHYSIOEYE_BASE_ROUTE}posture/`,
  );

  return response.data;
};

/**
 * ============================================================
 * ALIGNMENT
 * ============================================================
 *
 * GET physioeyetests/alignment/
 *
 * ============================================================
 */

export const getAlignment = async (): Promise<AlignmentResponse> => {
  const response = await api.get<AlignmentResponse>(
    `${PHYSIOEYE_BASE_ROUTE}alignment/`,
  );

  return response.data;
};

/**
 * ============================================================
 * UPPER BODY
 * ============================================================
 *
 * GET physioeyetests/uperbody/
 *
 * NOTE:
 * Backend route is "uperbody" with one "p".
 *
 * ============================================================
 */

export const getUpperBody = async (): Promise<UpperBodyResponse> => {
  const response = await api.get<UpperBodyResponse>(
    `${PHYSIOEYE_BASE_ROUTE}uperbody/`,
  );

  return response.data;
};

/**
 * ============================================================
 * LOWER BODY
 * ============================================================
 *
 * GET physioeyetests/lowerbody/
 *
 * ============================================================
 */

export const getLowerBody = async (): Promise<LowerBodyResponse> => {
  const response = await api.get<LowerBodyResponse>(
    `${PHYSIOEYE_BASE_ROUTE}lowerbody/`,
  );

  return response.data;
};

/**
 * ============================================================
 * FUNCTIONAL MOVEMENT
 * ============================================================
 *
 * GET physioeyetests/functionalmovement/
 *
 * ============================================================
 */

export const getFunctionalMovement =
  async (): Promise<FunctionalMovementResponse> => {
    const response = await api.get<FunctionalMovementResponse>(
      `${PHYSIOEYE_BASE_ROUTE}functionalmovement/`,
    );

    return response.data;
  };

/**
 * ============================================================
 * WALKING
 * ============================================================
 *
 * GET physioeyetests/walking/
 *
 * ============================================================
 */

export const getWalking = async (): Promise<WalkingResponse> => {
  const response = await api.get<WalkingResponse>(
    `${PHYSIOEYE_BASE_ROUTE}walking/`,
  );

  return response.data;
};

/**
 * ============================================================
 * GENERIC METRIC RESPONSE
 * ============================================================
 */

export type PhysioMetricResponse =
  | PostureResponse
  | AlignmentResponse
  | UpperBodyResponse
  | LowerBodyResponse
  | FunctionalMovementResponse
  | WalkingResponse;

/**
 * ============================================================
 * GENERIC METRIC API
 * ============================================================
 *
 * This is what MetricDetailScreen can use.
 *
 * Example:
 *
 * getPhysioMetric('posture')
 *
 * -> GET physioeyetests/posture/
 *
 * Example:
 *
 * getPhysioMetric('walking')
 *
 * -> GET physioeyetests/walking/
 *
 * ============================================================
 */

export const getPhysioMetric = async (
  metric: PhysioMetric,
): Promise<PhysioMetricResponse> => {
  switch (metric) {
    case 'posture':
      return getPosture();

    case 'alignment':
      return getAlignment();

    case 'upper_body':
      return getUpperBody();

    case 'lower_body':
      return getLowerBody();

    case 'functional_movement':
      return getFunctionalMovement();

    case 'walking':
      return getWalking();

    default: {
      const exhaustiveCheck: never = metric;

      throw new Error(`Unsupported PhysioEye metric: ${exhaustiveCheck}`);
    }
  }
};
