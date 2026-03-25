import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5173/api',
});

export interface FormaPagamento {
    formaPagamentoId?: number;
    descricaoPagamento: string;
}

export const formaPagamentoService = {
    cadastrar: async (formaPagamento: FormaPagamento) => {
        const response = await api.post('/formapagamento/formapagamento', formaPagamento);
        return response.data;
    },

    listar: async () => {
        const response = await api.get('/formapagamento/formapagamento');
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/formapagamento/formapagamento/${id}`);
        return response.data;
    },

    atualizar: async (id: number, formaPagamento: FormaPagamento) => {
        const response = await api.put(`/formapagamento/formapagamento/${id}`, formaPagamento);
        return response.data;
    },

    desativar: async (id: number) => {
        const response = await api.delete(`/formapagamento/formapagamento/${id}`);
        return response.data;
    }
};
