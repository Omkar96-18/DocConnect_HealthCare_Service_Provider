import axiosInstance from './axiosInstance';

export const getPrescriptions = (params) =>
  axiosInstance.get('/prescriptions/', { params });

export const getPrescription = (id) =>
  axiosInstance.get(`/prescriptions/${id}/`);

export const createPrescription = (data) =>
  axiosInstance.post('/prescriptions/', data);

export const validatePrescription = (id, barcode) =>
  axiosInstance.post(`/prescriptions/${id}/validate/`, { barcode });

export const getUnvalidatedPrescriptions = () =>
  axiosInstance.get('/prescriptions/unvalidated/');
