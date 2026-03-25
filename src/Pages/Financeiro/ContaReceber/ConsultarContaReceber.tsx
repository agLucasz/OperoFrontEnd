import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiDollarSign, FiUser, FiCheckSquare, FiX } from 'react-icons/fi';
import { contaReceberService, type ContaReceber } from '../../../Services/contaReceberService';
import { clienteService, type Cliente } from '../../../Services/clienteService';
import { formaPagamentoService, type FormaPagamento } from '../../../Services/formaPagamentoService';
import { notify } from '../../../Lib/notify';
import '../../../Styles/Financeiro/contaPagar.css';

function ConsultarContaReceber() {
    const [contas, setContas] = useState<ContaReceber[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filterCliente, setFilterCliente] = useState('');
    const [filterPeriodoInicio, setFilterPeriodoInicio] = useState('');
    const [filterPeriodoFim, setFilterPeriodoFim] = useState('');
    const [filterStatus, setFilterStatus] = useState('pendentes'); // 'pendentes', 'quitadas', 'todas'

    // Baixa Modal States
    const [isBaixaModalOpen, setIsBaixaModalOpen] = useState(false);
    const [contaToBaixa, setContaToBaixa] = useState<ContaReceber | null>(null);
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [selectedFormaPagamentoId, setSelectedFormaPagamentoId] = useState('');
    const [savingBaixa, setSavingBaixa] = useState(false);

    useEffect(() => {
        const loadAuxData = async () => {
            try {
                const [clientesData, formasData] = await Promise.all([
                    clienteService.listar(),
                    formaPagamentoService.listar()
                ]);
                setClientes(clientesData);
                setFormasPagamento(formasData);
            } catch (error) {
                console.error(error);
            }
        };
        loadAuxData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            let data: ContaReceber[] = [];
            
            if (filterStatus === 'pendentes') {
                if (filterCliente) {
                    data = await contaReceberService.listarPendentes(Number(filterCliente));
                } else {
                    // Sem cliente específico e pendente, não temos endpoint "listar todas pendentes" na API atual,
                    // mas podemos simular filtrando no front se tivéssemos.
                    // Como a API exige clienteId para pendentes, vamos pedir para selecionar o cliente.
                    notify.error('Selecione um cliente para buscar pendentes.');
                    setContas([]);
                    return;
                }
            } else if (filterStatus === 'quitadas') {
                if (!filterPeriodoInicio || !filterPeriodoFim) {
                    notify.error('Selecione o período para buscar contas quitadas.');
                    setContas([]);
                    return;
                }
                data = await contaReceberService.listarQuitadasPorPeriodo(filterPeriodoInicio, filterPeriodoFim);
            } else {
                // Todas (pendentes ou quitadas) por cliente e período
                if (!filterCliente || !filterPeriodoInicio || !filterPeriodoFim) {
                    notify.error('Selecione cliente e período para buscar todas as contas.');
                    setContas([]);
                    return;
                }
                data = await contaReceberService.listarPorClienteEPeriodoVencimento(Number(filterCliente), filterPeriodoInicio, filterPeriodoFim);
            }

            setContas(data || []);
        } catch (error) {
            notify.error('Erro ao carregar dados');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR').format(date);
    };

    const handleBaixaClick = (conta: ContaReceber) => {
        setContaToBaixa(conta);
        setSelectedFormaPagamentoId('');
        setIsBaixaModalOpen(true);
    };

    const handleConfirmBaixa = async () => {
        if (!contaToBaixa?.contaReceberId || !selectedFormaPagamentoId) {
            notify.error('Selecione a forma de pagamento');
            return;
        }

        setSavingBaixa(true);
        try {
            await contaReceberService.darBaixa(contaToBaixa.contaReceberId, Number(selectedFormaPagamentoId));
            notify.success('Conta recebida com sucesso!');
            setIsBaixaModalOpen(false);
            loadData();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao dar baixa';
            notify.error(message);
        } finally {
            setSavingBaixa(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="cp-filters">
                <div className="cp-form-group">
                    <label><FiUser style={{ marginRight: 6 }} /> Cliente</label>
                    <select value={filterCliente} onChange={e => setFilterCliente(e.target.value)}>
                        <option value="">Selecione...</option>
                        {clientes.map(c => (
                            <option key={c.clienteId} value={c.clienteId}>{c.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="cp-form-group">
                    <label><FiCheckSquare style={{ marginRight: 6 }} /> Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="pendentes">Pendentes (Requer Cliente)</option>
                        <option value="quitadas">Quitadas (Requer Período)</option>
                        <option value="todas">Todas (Requer Cliente e Período)</option>
                    </select>
                </div>
                <div className="cp-form-group">
                    <label><FiCalendar style={{ marginRight: 6 }} /> Período Início</label>
                    <input 
                        type="date" 
                        value={filterPeriodoInicio} 
                        onChange={e => setFilterPeriodoInicio(e.target.value)} 
                    />
                </div>
                <div className="cp-form-group">
                    <label><FiCalendar style={{ marginRight: 6 }} /> Período Fim</label>
                    <input 
                        type="date" 
                        value={filterPeriodoFim} 
                        onChange={e => setFilterPeriodoFim(e.target.value)} 
                    />
                </div>
                <div className="cp-form-group" style={{ justifyContent: 'flex-end' }}>
                    <button 
                        className="btn-primary" 
                        onClick={loadData}
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FiSearch /> Buscar
                    </button>
                </div>
            </div>

            <div className="cp-table-container">
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>Carregando...</div>
                ) : contas.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                        Nenhuma conta encontrada.
                    </div>
                ) : (
                    <table className="cp-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>OS</th>
                                <th>Parcela</th>
                                <th>Vencimento</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contas.map((conta) => (
                                <tr key={conta.contaReceberId}>
                                    <td>{conta.cliente || '-'}</td>
                                    <td>#{conta.ordemServicoId}</td>
                                    <td>{conta.numeroParcela}</td>
                                    <td>{formatDate(conta.dataVencimento)}</td>
                                    <td style={{ fontWeight: '500' }}>{formatCurrency(conta.valorParcela)}</td>
                                    <td>
                                        <span className={`cp-status-badge ${conta.pago ? 'status-pago' : 'status-pendente'}`}>
                                            {conta.pago ? 'Recebido' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {!conta.pago && (
                                            <button 
                                                className="action-btn" 
                                                style={{ color: 'var(--blue)' }}
                                                onClick={() => handleBaixaClick(conta)}
                                                title="Receber (Dar Baixa)"
                                            >
                                                <FiDollarSign size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isBaixaModalOpen && (
                <div className="cp-modal-overlay" onClick={() => setIsBaixaModalOpen(false)}>
                    <div className="cp-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="cp-modal-header">
                            <h3 style={{ margin: 0 }}>Receber Conta</h3>
                            <button className="cp-modal-close" onClick={() => setIsBaixaModalOpen(false)}>
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="cp-modal-body">
                            <div className="cp-form-group" style={{ marginBottom: '24px' }}>
                                <label>Forma de Pagamento*</label>
                                <select 
                                    value={selectedFormaPagamentoId} 
                                    onChange={(e) => setSelectedFormaPagamentoId(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Selecione...</option>
                                    {formasPagamento.map(f => (
                                        <option key={f.formaPagamentoId} value={f.formaPagamentoId}>
                                            {f.descricaoPagamento}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Valor a Receber</p>
                                <h2 style={{ margin: 0, color: 'var(--blue)' }}>
                                    {contaToBaixa ? formatCurrency(contaToBaixa.valorParcela) : ''}
                                </h2>
                            </div>

                            <div className="cp-form-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setIsBaixaModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-primary" 
                                    onClick={handleConfirmBaixa}
                                    disabled={savingBaixa || !selectedFormaPagamentoId}
                                >
                                    {savingBaixa ? 'Salvando...' : 'Confirmar Recebimento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConsultarContaReceber;