import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getChildren = async () => {
  const response = await api.get('/children');
  return response.data;
};

export const getChild = async (id) => {
  const response = await api.get(`/children/${id}`);
  return response.data;
};

export const createChild = async (childData) => {
  const response = await api.post('/children', childData);
  return response.data;
};

export const updateChild = async (id, childData) => {
  const response = await api.put(`/children/${id}`, childData);
  return response.data;
};

export const deleteChild = async (id) => {
  const response = await api.delete(`/children/${id}`);
  return response.data;
};

export const getGrowthMeasurements = async (childId) => {
  const response = await api.get(`/children/${childId}/measurements`);
  return response.data;
};

export const getGrowthSummary = async (childId) => {
  const response = await api.get(`/children/${childId}/growth-summary`);
  return response.data;
};

export const addGrowthMeasurement = async (childId, measurementData) => {
  const response = await api.post(`/children/${childId}/measurements`, measurementData);
  return response.data;
};

export const deleteGrowthMeasurement = async (measurementId) => {
  const response = await api.delete(`/measurements/${measurementId}`);
  return response.data;
};

// Milestone API Service Calls
export const getMilestoneQuestions = async (ageMonths) => {
  const response = await api.get(`/milestones/questions?age_months=${ageMonths}`);
  return response.data;
};

export const submitMilestoneAssessment = async (childId, assessmentData) => {
  const response = await api.post(`/children/${childId}/assessments`, assessmentData);
  return response.data;
};

export const getMilestoneAssessments = async (childId) => {
  const response = await api.get(`/children/${childId}/assessments`);
  return response.data;
};

export const getMilestoneAssessmentDetail = async (childId, assessmentId) => {
  const response = await api.get(`/children/${childId}/assessments/${assessmentId}`);
  return response.data;
};

// ML Prediction API Service Calls
export const predictChildMonitoring = async (childId, assessmentId = null) => {
  const payload = assessmentId ? { milestone_assessment_id: assessmentId } : {};
  const response = await api.post(`/children/${childId}/predict`, payload);
  return response.data;
};

export const getChildPredictions = async (childId) => {
  const response = await api.get(`/children/${childId}/predictions`);
  return response.data;
};

export const getMLModelInfo = async () => {
  const response = await api.get('/ml/info');
  return response.data;
};

export default api;


