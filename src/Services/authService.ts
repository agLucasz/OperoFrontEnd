import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

const setToken = (token: string) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const initializeToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

initializeToken();

export const cadastrar = async (usuario: {
  nome: string;
  email: string;
  senha: string;
}) => {
  const response = await api.post('/usuario/cadastro', usuario);
  return response.data;
};

export const login = async (email: string, senha: string) => {
  const response = await api.post('/auth', { email, senha });
  const data = response.data as { token?: string; Token?: string };
  const token = data.token ?? data.Token;
  if (token) setToken(token);
  return data;
};

export const http = api;
