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

export interface CategoriaDespesa {
    categoriaId?: number;
    nomeCategoria: string;
}

export interface Despesa {
    despesaId?: number;
    nomeDespesa: string;
}

export const categoriaDespesaService = {
    cadastrar: async (categoria: CategoriaDespesa) => {
        const response = await api.post('/despesa/categoria', categoria);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/despesa/categoria');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/despesa/categoria/${id}`);
        return response.data;
    },

    atualizar: async (id: number, categoria: CategoriaDespesa) => {
        const response = await api.put(`/despesa/categoria/${id}`, categoria);
        return response.data;
    },

    desativar: async (id: number) => {
        const response = await api.delete(`/despesa/categoria/${id}`);
        return response.data;
    }
};

export const despesaService = {
    cadastrar: async (despesa: Despesa) => {
        const response = await api.post('/despesa/despesa', despesa);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/despesa/despesa');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/despesa/despesa${id}`);
        return response.data;
    },

    atualizar: async (id: number, despesa: Despesa) => {
        const response = await api.put(`/despesa/despesa/${id}`, despesa);
        return response.data;
    },

    desativar: async (id: number) => {
        const response = await api.delete(`/despesa/despesa/${id}`);
        return response.data;
    }
};
