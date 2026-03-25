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

export interface CategoriaProduto {
    categoriaId?: number;
    nomeCategoria: string;
}

export const categoriaProdutoService = {
    cadastrar: async (categoria: CategoriaProduto) => {
        const response = await api.post('/produto/categoria', categoria);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/produto/categoria');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/produto/categoria/${id}`);
        return response.data;
    },

    atualizar: async (id: number, categoria: CategoriaProduto) => {
        const response = await api.put(`/produto/categoria/${id}`, categoria);
        return response.data;
    },

    excluir: async (id: number) => {
        const response = await api.delete(`/produto/categoria/${id}`);
        return response.data;
    }
};
