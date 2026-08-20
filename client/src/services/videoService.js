import api from './api';

export const searchVideos = (q, maxResults = 20, pageToken = '') =>
  api.get('/videos/search', { params: { q, maxResults, pageToken } }).then(r => r.data);

export const getTrending = (maxResults = 20) =>
  api.get('/videos/trending', { params: { maxResults } }).then(r => r.data);

export const getVideoById = (id) =>
  api.get(`/videos/${id}`).then(r => r.data);

export const getRelatedVideos = (id) =>
  api.get(`/videos/${id}/related`).then(r => r.data);

export const getShorts = () =>
  api.get('/videos/shorts').then(r => r.data);

export const getSuggestions = (q) =>
  api.get('/videos/suggestions', { params: { q } }).then(r => r.data);

export const getChannelInfo = (id) =>
  api.get(`/channels/${id}`).then(r => r.data);

export const getChannelVideos = (id) =>
  api.get(`/channels/${id}/videos`).then(r => r.data);
