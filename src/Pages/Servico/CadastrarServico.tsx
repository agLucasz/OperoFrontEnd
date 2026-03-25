import { useState } from 'react';
import '../../Styles/Servico/servico.css';
import { servicoService, type Servico } from '../../Services/servicoService';
import { notify } from '../../Lib/notify';

function CadastrarServico() {
    const [loading, setLoading] = useState(false);
    const [valorServicoDisplay, setValorServicoDisplay] = useState('');
    const [formData, setFormData] = useState<Servico>({
        nomeServico: '',
        descricaoServico: '',
        valorServico: 0
    });

    // Função para formatar moeda
    const formatCurrency = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v === '') return '';
        const numericValue = parseInt(v) / 100;
        return numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCurrency(e.target.value);
        setValorServicoDisplay(formattedValue);
        
        if (formattedValue) {
            const numericString = formattedValue.replace(/\./g, '').replace(',', '.');
            setFormData(prev => ({ ...prev, valorServico: Number(numericString) }));
        } else {
            setFormData(prev => ({ ...prev, valorServico: 0 }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nomeServico) {
            notify.error('Nome do serviço é obrigatório');
            return;
        }

        if (formData.valorServico <= 0) {
            notify.error('Valor do serviço deve ser maior que zero');
            return;
        }

        setLoading(true);
        try {
            await servicoService.cadastrar(formData);
            notify.success('Serviço cadastrado com sucesso!');
 
            setFormData({
                nomeServico: '',
                descricaoServico: '',
                valorServico: 0
            });
            setValorServicoDisplay('');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar serviço';
            notify.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <div className="servico-header" style={{ marginBottom: 32 }}>
                <h2>Novo Serviço</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="nomeServico">Nome do Serviço *</label>
                        <input 
                            type="text" 
                            id="nomeServico" 
                            placeholder="Ex: Lavagem Simples, Polimento, Troca de Óleo" 
                            value={formData.nomeServico}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group field-valor">
                        <label htmlFor="valorServico">Valor (R$) *</label>
                        <input 
                            type="text" 
                            id="valorServico" 
                            placeholder="0,00" 
                            value={valorServicoDisplay}
                            onChange={handleValorChange}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="descricaoServico">Descrição</label>
                        <textarea 
                            id="descricaoServico" 
                            placeholder="Detalhes sobre o serviço..." 
                            value={formData.descricaoServico}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => window.location.reload()} 
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Serviço'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarServico;
