import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5173/api', // Using the proxy setup in vite.config.ts
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Fornecedor {
    fornecedorId?: number;
    nomeFornecedor: string;
    documentoFornecedor: string;
    telefoneFornecedor: string;
    enderecoFornecedor?: string;
    bairroFornecedor?: string;
    cepFornecedor?: string;
    cidadeFornecedor?: string;
    ufFornecedor?: string;
    ativo?: boolean;
    dataCadastro?: string;
}

export const fornecedorService = {
    cadastrar: async (fornecedor: Fornecedor) => {
        const response = await api.post('/fornecedor/fornecedor', fornecedor);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/fornecedor/fornecedor');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/fornecedor/fornecedor/${id}`);
        return response.data;
    },

    atualizar: async (id: number, fornecedor: Fornecedor) => {
        const response = await api.put(`/fornecedor/fornecedor/${id}`, fornecedor);
        return response.data;
    },

    desativar: async (id: number) => {
        const response = await api.delete(`/fornecedor/fornecedor/${id}`);
        return response.data;
    }
};
