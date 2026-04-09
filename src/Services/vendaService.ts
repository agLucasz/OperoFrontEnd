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

export interface VendaItemCreateDTO {
    produtoId: number;
    quantidadeItem: number;
    valorUnitario: number;
}

export interface VendaCreateDTO {
    dtVenda: string;
    items: VendaItemCreateDTO[];
}

export interface VendaItemDTO {
    vendaItemId: number;
    vendaId: number;
    produtoId: number;
    produto: string;
    valorUnitario: number;
    quantidadeItem: number;
    valorTotal: number;
}

export interface VendaDTO {
    vendaId: number;
    dtVenda: string;
    itens: VendaItemDTO[];
    valorTotal: number;
}

export const vendaService = {
    lancar: async (venda: VendaCreateDTO, confirmarDesconto: boolean = false) => {
        const response = await api.post(`/venda/venda?confirmarDesconto=${confirmarDesconto}`, venda);
        return response.data as VendaDTO;
    },

    listar: async () => {
        const response = await api.get('/venda/venda');
        return response.data as VendaDTO[];
    },

    obter: async (vendaId: number) => {
        const response = await api.get(`/venda/${vendaId}`);
        return response.data as VendaDTO;
    },

    excluir: async (vendaId: number) => {
        const response = await api.delete(`/venda/${vendaId}`);
        return response.data;
    },
};
