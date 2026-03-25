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

export interface Produto {
    produtoId?: number;
    nomeProduto: string;
    codigoProduto: string;
    precoVenda: number;
    precoCompra: number;
    quantidadeProduto: number;
    descricaoProduto: string;
    categoriaId: number;
    nomeCategoria?: string;
}

export const produtoService = {
    cadastrar: async (produto: Produto) => {
        const response = await api.post('/produto/produto', produto);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/produto/produto');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/produto/produto/${id}`);
        return response.data;
    },

    atualizar: async (id: number, produto: Produto) => {
        const response = await api.put(`/produto/produto/${id}`, produto);
        return response.data;
    },

    excluir: async (id: number) => {
        const response = await api.delete(`/produto/produto/${id}`);
        return response.data;
    }
};
