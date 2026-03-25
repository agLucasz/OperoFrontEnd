import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5173/api', // Using the proxy setup in vite.config.ts which forwards /api to backend
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Cliente {
    clienteId?: number;
    nome: string;
    documento: string;
    telefone: string;
    email: string;
    endereco?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
    ativo?: boolean;
    dataCadastro?: string;
}

export const clienteService = {
    cadastrar: async (cliente: Cliente) => {
        const response = await api.post('/cliente/cliente', cliente);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/cliente/cliente');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/cliente/cliente/${id}`);
        return response.data;
    },

    atualizar: async (id: number, cliente: Cliente) => {
        const response = await api.put(`/cliente/cliente/${id}`, cliente);
        return response.data;
    },

    desativar: async (id: number) => {
        const response = await api.delete(`/cliente/cliente/${id}`);
        return response.data;
    }
};
