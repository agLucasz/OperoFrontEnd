import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5173/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface EntradaEstoqueCreateDTO {
    produtoId: number;
    quantidadeProduto: number;
    dataEntrada: string;
}

export interface EntradaEstoqueDTO {
    estoqueId: number;
    produtoId: number;
    produto: string;
    quantidadeProduto: number;
    dataEntrada: string;
}

export const entradaEstoqueService = {
    lancar: async (dto: EntradaEstoqueCreateDTO) => {
        const response = await api.post('/entradaEstoque/entradaEstoque', dto);
        return response.data as EntradaEstoqueDTO;
    },

    listar: async () => {
        const response = await api.get('/entradaEstoque/entradaEstoque');
        return response.data as EntradaEstoqueDTO[];
    },

    excluir: async (estoqueId: number) => {
        const response = await api.delete(`/entradaEstoque/entradaEstoque/${estoqueId}`);
        return response.data;
    },
};
