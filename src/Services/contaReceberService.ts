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

export interface CondicaoPagamentoParcelaDTO {
    numeroParcela: number;
    valorParcela: number;
    dataVencimento: string;
}

export interface ContaReceber {
    contaReceberId?: number;
    clienteId: number;
    cliente?: string;
    ordemServicoId: number;
    numeroParcela: number;
    valorParcela: number;
    dataVencimento: string;
    pago: boolean;
    dataBaixa?: string;
    formaPagamentoId?: number;
    formaPagamento?: string;
    dataCriacao?: string;
}

export const contaReceberService = {
    gerarPorOrdemServico: async (ordemServicoId: number, parcelas: CondicaoPagamentoParcelaDTO[]) => {
        const response = await api.post(`/contareceber/gerar-por-ordemservico/${ordemServicoId}`, parcelas);
        return response.data;
    },

    listarPendentes: async (clienteId: number) => {
        const response = await api.get(`/contareceber/pendentes/${clienteId}`);
        return response.data;
    },

    obterTotalPendente: async (clienteId: number) => {
        const response = await api.get(`/contareceber/total-pendente/${clienteId}`);
        return response.data;
    },

    darBaixa: async (contaReceberId: number, formaPagamentoId: number) => {
        const response = await api.post(`/contareceber/baixa/${contaReceberId}`, { formaPagamentoId });
        return response.data;
    },

    listarPorClienteEPeriodoVencimento: async (clienteId: number, inicio: string, fim: string) => {
        const response = await api.get(`/contareceber/cliente/${clienteId}/vencimento`, {
            params: { inicio, fim }
        });
        return response.data;
    },

    listarQuitadasPorPeriodo: async (inicio: string, fim: string) => {
        const response = await api.get(`/contareceber/quitadas`, {
            params: { inicio, fim }
        });
        return response.data;
    }
};