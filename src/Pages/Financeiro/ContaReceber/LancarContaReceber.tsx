import { useState, useEffect } from 'react';
import { FiDollarSign, FiSearch, FiTrash2, FiPlus } from 'react-icons/fi';
import { contaReceberService, type CondicaoPagamentoParcelaDTO } from '../../../Services/contaReceberService';
import { ordemServicoService, type OrdemServico } from '../../../Services/ordemServicoService';
import { notify } from '../../../Lib/notify';
import '../../../Styles/Financeiro/contaPagar.css';

function LancarContaReceber() {
    const [loading, setLoading] = useState(false);
    
    // Data sources
    const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
    
    // Form State
    const [selectedOrdemServicoId, setSelectedOrdemServicoId] = useState<number | ''>('');
    const [parcelas, setParcelas] = useState<CondicaoPagamentoParcelaDTO[]>([]);
    
    // New Parcela State
    const [valorParcelaDisplay, setValorParcelaDisplay] = useState('');
    const [dtVencimento, setDtVencimento] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Carregar apenas ordens de serviço (idealmente as finalizadas ou que precisam de faturamento)
                const osData = await ordemServicoService.listar();
                setOrdensServico(osData);
            } catch (error) {
                notify.error('Erro ao carregar Ordens de Serviço');
                console.error(error);
            }
        };
        loadData();
    }, []);

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
        setValorParcelaDisplay(formattedValue);
    };

    const handleAddParcela = () => {
        if (!valorParcelaDisplay || !dtVencimento) {
            notify.error('Preencha o valor e a data de vencimento da parcela');
            return;
        }

        const numericString = valorParcelaDisplay.replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(numericString);

        if (valor <= 0) {
            notify.error('O valor deve ser maior que zero');
            return;
        }

        const novaParcela: CondicaoPagamentoParcelaDTO = {
            numeroParcela: parcelas.length + 1,
            valorParcela: valor,
            dataVencimento: dtVencimento
        };

        setParcelas([...parcelas, novaParcela]);
        setValorParcelaDisplay('');
        setDtVencimento('');
    };

    const handleRemoveParcela = (index: number) => {
        const novasParcelas = parcelas.filter((_, i) => i !== index).map((p, i) => ({
            ...p,
            numeroParcela: i + 1
        }));
        setParcelas(novasParcelas);
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedOrdemServicoId) {
            notify.error('Selecione uma Ordem de Serviço');
            return;
        }

        if (parcelas.length === 0) {
            notify.error('Adicione pelo menos uma parcela');
            return;
        }

        setLoading(true);
        try {
            await contaReceberService.gerarPorOrdemServico(Number(selectedOrdemServicoId), parcelas);
            notify.success('Contas a receber geradas com sucesso!');
            
            // Reset form
            setSelectedOrdemServicoId('');
            setParcelas([]);
            setValorParcelaDisplay('');
            setDtVencimento('');
            
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao gerar contas a receber';
            notify.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const valorTotalParcelas = parcelas.reduce((acc, p) => acc + p.valorParcela, 0);

    return (
        <div className="cp-form-container">
            <form onSubmit={handleSalvar}>
                
                <div className="cp-form-section">
                    <h3 className="cp-form-section-title"><FiSearch /> Ordem de Serviço</h3>
                    <div className="cp-form-row">
                        <div className="cp-form-group">
                            <label>Selecione a Ordem de Serviço*</label>
                            <select 
                                value={selectedOrdemServicoId}
                                onChange={(e) => setSelectedOrdemServicoId(e.target.value === '' ? '' : Number(e.target.value))}
                                required
                            >
                                <option value="">Selecione...</option>
                                {ordensServico.map(os => (
                                    <option key={os.ordemServicoId} value={os.ordemServicoId}>
                                        OS #{os.ordemServicoId} - {os.nomeCliente || 'Cliente não informado'} (Total: R$ {os.valorTotal?.toFixed(2) || '0.00'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cp-form-section">
                    <h3 className="cp-form-section-title"><FiDollarSign /> Parcelas</h3>
                    
                    <div className="cp-form-row" style={{ alignItems: 'flex-end' }}>
                        <div className="cp-form-group small">
                            <label>Valor da Parcela (R$)</label>
                            <input 
                                type="text" 
                                placeholder="0,00"
                                value={valorParcelaDisplay} 
                                onChange={handleValorChange} 
                            />
                        </div>
                        <div className="cp-form-group small">
                            <label>Data de Vencimento</label>
                            <input 
                                type="date" 
                                value={dtVencimento} 
                                onChange={(e) => setDtVencimento(e.target.value)} 
                            />
                        </div>
                        <div className="cp-form-group small" style={{ flex: 'none' }}>
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={handleAddParcela}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}
                            >
                                <FiPlus /> Adicionar
                            </button>
                        </div>
                    </div>

                    {parcelas.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            <table className="cp-table">
                                <thead>
                                    <tr>
                                        <th>Parcela</th>
                                        <th>Vencimento</th>
                                        <th>Valor</th>
                                        <th style={{ textAlign: 'center', width: '80px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parcelas.map((p, index) => (
                                        <tr key={index}>
                                            <td>{p.numeroParcela}ª Parcela</td>
                                            <td>{new Date(p.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                            <td>R$ {p.valorParcela.toFixed(2).replace('.', ',')}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveParcela(index)}
                                                    className="action-btn delete"
                                                    title="Remover"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                        <td colSpan={2} style={{ fontWeight: 'bold', color: 'var(--blue)' }}>
                                            R$ {valorTotalParcelas.toFixed(2).replace('.', ',')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <div className="cp-form-actions">
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
                        disabled={loading || parcelas.length === 0}
                    >
                        {loading ? 'Salvando...' : 'Gerar Contas a Receber'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LancarContaReceber;