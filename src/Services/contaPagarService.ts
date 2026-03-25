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

export interface ContaPagar {
    contaPagarId?: number;
    categoriaId: number;
    categoria?: string;
    despesaId: number;
    despesa?: string;
    fornecedorId?: number;
    fornecedor?: string;
    vlParcela: number;
    parcela: number;
    dtVencimento: string;
    numDocumento?: number;
    tpDocumento: number | string;
    dataCadastro?: string;
}

export const contaPagarService = {
    cadastrar: async (contaPagar: Partial<ContaPagar>) => {
        const response = await api.post('/contapagar/contapagar', contaPagar);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/contapagar/contapagar');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/contapagar/contapagar/${id}`);
        return response.data;
    },

    atualizar: async (id: number, contaPagar: Partial<ContaPagar>) => {
        const response = await api.put(`/contapagar/contapagar/${id}`, contaPagar);
        return response.data;
    },

    excluir: async (id: number) => {
        const response = await api.delete(`/contapagar/contapagar/${id}`);
        return response.data;
    }
};
