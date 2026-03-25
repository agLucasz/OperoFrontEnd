import React, { useState } from 'react';
import { formaPagamentoService, type FormaPagamento } from '../../Services/formaPagamentoService';
import { notify } from '../../Lib/notify';

function CadastrarFormaPagamento() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormaPagamento>({
        descricaoPagamento: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.descricaoPagamento) {
            notify.error('A descrição da forma de pagamento é obrigatória');
            return;
        }

        setLoading(true);
        try {
            await formaPagamentoService.cadastrar(formData);
            notify.success('Forma de pagamento cadastrada com sucesso!');
            
            setFormData({
                descricaoPagamento: ''
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar forma de pagamento';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <form onSubmit={handleSubmit}>
                <div className="standard-form-header">
                    <h2>Nova Forma de Pagamento</h2>
                    <p>Preencha os dados abaixo para cadastrar uma nova forma de pagamento no sistema.</p>
                </div>

                <div className="standard-form-grid">
                    <div className="standard-form-group">
                        <label htmlFor="descricaoPagamento">Descrição da Forma de Pagamento *</label>
                        <input
                            type="text"
                            id="descricaoPagamento"
                            name="descricaoPagamento"
                            value={formData.descricaoPagamento}
                            onChange={handleChange}
                            placeholder="Ex: Cartão de Crédito, Pix, Boleto"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="standard-form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => setFormData({ descricaoPagamento: '' })}
                        disabled={loading}
                    >
                        Limpar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Cadastrando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarFormaPagamento;
