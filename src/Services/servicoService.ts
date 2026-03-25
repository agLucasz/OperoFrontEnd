import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5173/api',
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Servico {
    servicoId?: number;
    nomeServico: string;
    descricaoServico: string;
    valorServico: number;
}

export const servicoService = {
    cadastrar: async (servico: Servico) => {
        const response = await api.post('/servico/servico', servico);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/servico/servico');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/servico/servico/${id}`);
        return response.data;
    },

    atualizar: async (id: number, servico: Servico) => {
        const response = await api.put(`/servico/servico/${id}`, servico);
        return response.data;
    },

    excluir: async (id: number) => {
        const response = await api.delete(`/servico/servico/${id}`);
        return response.data;
    }
};
