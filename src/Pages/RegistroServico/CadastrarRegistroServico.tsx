import React, { useState, useEffect } from 'react';
import { registroServicoService, type RegistroServico } from '../../Services/registroServicoService';
import { formaPagamentoService, type FormaPagamento } from '../../Services/formaPagamentoService';
import { notify } from '../../Lib/notify';
import '../../Styles/RegistroServico/registroServico.css';

function CadastrarRegistroServico() {
    const [loading, setLoading] = useState(false);
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [statusPagamento, setStatusPagamento] = useState<'pago' | 'nao_pago'>('nao_pago');
    const [valorServicoDisplay, setValorServicoDisplay] = useState('');
    
    const [formData, setFormData] = useState<RegistroServico>({
        nomeServico: '',
        nomeCliente: '',
        veiculo: '',
        valorServico: 0,
        dataServico: new Date().toISOString().split('T')[0], // Default today
        formaPagamentoId: undefined
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

    useEffect(() => {
        const loadFormasPagamento = async () => {
            try {
                const data = await formaPagamentoService.listar();
                setFormasPagamento(data);
            } catch (error) {
                console.error("Erro ao carregar formas de pagamento", error);
            }
        };
        loadFormasPagamento();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name === 'statusPagamento') {
            setStatusPagamento(value as 'pago' | 'nao_pago');
            if (value === 'nao_pago') {
                setFormData(prev => ({ ...prev, formaPagamentoId: undefined }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nomeServico) {
            notify.error('O nome do serviço é obrigatório');
            return;
        }
        if (formData.valorServico <= 0) {
            notify.error('O valor do serviço deve ser maior que zero');
            return;
        }
        if (!formData.dataServico) {
            notify.error('A data do serviço é obrigatória');
            return;
        }

        if (statusPagamento === 'pago' && !formData.formaPagamentoId) {
            notify.error('Selecione uma forma de pagamento para serviços pagos');
            return;
        }

        setLoading(true);
        try {
            const submitData = { ...formData };
            if (statusPagamento === 'nao_pago') {
                submitData.formaPagamentoId = undefined;
            }

            await registroServicoService.cadastrar(submitData);
            notify.success('Registro de serviço cadastrado com sucesso!');
            
            setFormData({
                nomeServico: '',
                nomeCliente: '',
                veiculo: '',
                valorServico: 0,
                dataServico: new Date().toISOString().split('T')[0],
                formaPagamentoId: undefined
            });
            setValorServicoDisplay('');
            setStatusPagamento('nao_pago');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar registro de serviço';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container" style={{ maxWidth: '1200px' }}>
            <form onSubmit={handleSubmit}>
                <div className="rs-form-section">
                    <h3 className="rs-form-section-title">Dados Gerais</h3>
                    <div className="rs-form-row">
                        <div className="rs-form-group flex-2">
                            <label htmlFor="nomeServico">Nome do Serviço *</label>
                            <input
                                type="text"
                                id="nomeServico"
                                name="nomeServico"
                                value={formData.nomeServico}
                                onChange={handleChange}
                                placeholder="Ex: Troca de óleo"
                                disabled={loading}
                            />
                        </div>

                        <div className="rs-form-group flex-2">
                            <label htmlFor="nomeCliente">Cliente</label>
                            <input
                                type="text"
                                id="nomeCliente"
                                name="nomeCliente"
                                value={formData.nomeCliente}
                                onChange={handleChange}
                                placeholder="Nome do cliente (Opcional)"
                                disabled={loading}
                            />
                        </div>

                        <div className="rs-form-group flex-1">
                            <label htmlFor="dataServico">Data do Serviço *</label>
                            <input
                                type="date"
                                id="dataServico"
                                name="dataServico"
                                value={formData.dataServico}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="rs-form-group flex-1">
                            <label htmlFor="veiculo">Veículo / Placa</label>
                            <input
                                type="text"
                                id="veiculo"
                                name="veiculo"
                                value={formData.veiculo}
                                onChange={handleChange}
                                placeholder="Ex: Honda Civic ABC-1234"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <div className="rs-form-section">
                    <h3 className="rs-form-section-title">Valores e Pagamento</h3>
                    <div className="rs-form-row">
                        <div className="rs-form-group flex-1">
                            <label htmlFor="valorServico">Valor do Serviço (R$) *</label>
                            <input
                                type="text"
                                id="valorServico"
                                name="valorServico"
                                value={valorServicoDisplay}
                                onChange={handleValorChange}
                                placeholder="0,00"
                                disabled={loading}
                            />
                        </div>

                        <div className="rs-form-group flex-1">
                            <label>Status de Pagamento</label>
                            <div className="rs-checkbox-group" style={{ marginTop: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                                    <input
                                        type="radio"
                                        name="statusPagamento"
                                        value="pago"
                                        checked={statusPagamento === 'pago'}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    Pago
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
                                    <input
                                        type="radio"
                                        name="statusPagamento"
                                        value="nao_pago"
                                        checked={statusPagamento === 'nao_pago'}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    Não Pago
                                </label>
                            </div>
                        </div>

                        <div className="rs-form-group flex-2">
                            {statusPagamento === 'pago' ? (
                                <>
                                    <label htmlFor="formaPagamentoId">Forma de Pagamento *</label>
                                    <select
                                        id="formaPagamentoId"
                                        name="formaPagamentoId"
                                        value={formData.formaPagamentoId || ''}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="">Selecione a forma de pagamento</option>
                                        {formasPagamento.map(fp => (
                                            <option key={fp.formaPagamentoId} value={fp.formaPagamentoId}>
                                                {fp.descricaoPagamento}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <div style={{ visibility: 'hidden' }}>
                                    <label>Placeholder</label>
                                    <select><option>Placeholder</option></select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => {
                            setFormData({
                                nomeServico: '',
                                nomeCliente: '',
                                veiculo: '',
                                valorServico: 0,
                                dataServico: new Date().toISOString().split('T')[0],
                                formaPagamentoId: undefined
                            });
                            setValorServicoDisplay('');
                            setStatusPagamento('nao_pago');
                        }}
                        disabled={loading}
                    >
                        Limpar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarRegistroServico;