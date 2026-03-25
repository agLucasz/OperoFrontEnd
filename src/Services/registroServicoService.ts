import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5173/api',
});

export interface RegistroServico {
    registroServicoId?: number;
    nomeServico: string;
    nomeCliente?: string;
    veiculo?: string;
    valorServico: number;
    dataServico: string;
    formaPagamentoId?: number;
}

export const registroServicoService = {
    cadastrar: async (registro: RegistroServico) => {
        const response = await api.post('/registroServico/registroServico', registro);
        return response.data;
    },

    listar: async (inicio?: string, fim?: string) => {
        let url = '/registroServico/registroServico';
        if (inicio && fim) {
            url += `?inicio=${inicio}&fim=${fim}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    obter: async (id: number) => {
        const response = await api.get(`/registroServico/registroServico/${id}`);
        return response.data;
    },

    atualizar: async (id: number, registro: RegistroServico) => {
        const response = await api.put(`/registroServico/registroServico/${id}`, registro);
        return response.data;
    },

    excluir: async (id: number) => {
        const response = await api.delete(`/registroServico/registroServico/${id}`);
        return response.data;
    }
};
