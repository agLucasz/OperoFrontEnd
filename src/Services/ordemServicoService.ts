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

export interface OrdemServicoItem {
    itemId?: number;
    ordemServicoId?: number;
    servicoId?: number;
    nomeServico?: string;
    produtoId?: number;
    nomeProduto?: string;
    descricao?: string;
    valorItem: number;
    quantidadeItem: number;
}

export interface OrdemServico {
    ordemServicoId?: number;
    clienteId: number;
    nomeCliente?: string;
    veiculo?: string;
    placa?: string;
    status?: number;
    statusDescricao?: string;
    dataAbertura?: string;
    dataFechamento?: string;
    valorTotal?: number;
    itens: OrdemServicoItem[];
}

export interface CondicaoPagamentoPrazoRequest {
    quantidadeParcelas: number;
    dataPrimeiroVencimento: string;
    formaPagamentoId: number;
}

export interface CondicaoPagamentoParcela {
    numeroParcela: number;
    valorParcela: number;
    dataVencimento: string;
    formaPagamentoId: number;
}

export const ordemServicoService = {
    cadastrar: async (os: Partial<OrdemServico>) => {
        const response = await api.post('/ordemservico/ordemservico', os);
        return response.data;
    },

    listar: async (status?: number, clienteId?: number) => {
        const params = new URLSearchParams();
        if (status !== undefined) params.append('status', status.toString());
        if (clienteId !== undefined) params.append('clienteId', clienteId.toString());
        
        const response = await api.get(`/ordemservico/ordemservico?${params.toString()}`);
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/ordemservico/ordemservico/${id}`);
        return response.data;
    },

    adicionarItem: async (ordemServicoId: number, item: OrdemServicoItem) => {
        const response = await api.post(`/ordemservico/ordemservico/${ordemServicoId}/item`, item);
        return response.data;
    },

    removerItem: async (ordemServicoId: number, itemId: number) => {
        const response = await api.delete(`/ordemservico/ordemservico/${ordemServicoId}/item/${itemId}`);
        return response.data;
    },

    finalizar: async (id: number) => {
        const response = await api.post(`/ordemservico/ordemservico/${id}/finalizar`);
        return response.data;
    },

    cancelar: async (id: number) => {
        const response = await api.post(`/ordemservico/ordemservico/${id}/cancelar`);
        return response.data;
    },

    reabrir: async (id: number) => {
        const response = await api.post(`/ordemservico/ordemservico/${id}/reabrir`);
        return response.data;
    },

    gerarCondicaoPagamentoClientePrazoPreview: async (
        ordemServicoId: number,
        condicao: CondicaoPagamentoPrazoRequest
    ) => {
        const response = await api.post(
            `/ordemservico/ordemservico/${ordemServicoId}/condicao-pagamento/cliente-prazo/preview`,
            condicao
        );
        return response.data as CondicaoPagamentoParcela[];
    }
};
