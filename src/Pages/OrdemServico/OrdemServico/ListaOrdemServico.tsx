import { useState, useEffect } from 'react';
import { ordemServicoService, type OrdemServico } from '../../../Services/ordemServicoService';
import { FiSearch, FiCheckCircle, FiXCircle, FiRefreshCcw } from 'react-icons/fi';
import { notify } from '../../../Lib/notify';

function ListaOrdemServico() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await ordemServicoService.listar(statusFilter);
            setOrdens(data);
        } catch (error) {
            console.error('Erro ao carregar ordens de serviço:', error);
            notify.error('Erro ao carregar ordens de serviço');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'finalizar' | 'cancelar' | 'reabrir') => {
        const actionText = action === 'finalizar' ? 'finalizar' : action === 'cancelar' ? 'cancelar' : 'reabrir';
        if (!window.confirm(`Tem certeza que deseja ${actionText} esta Ordem de Serviço?`)) return;

        try {
            if (action === 'finalizar') await ordemServicoService.finalizar(id);
            if (action === 'cancelar') await ordemServicoService.cancelar(id);
            if (action === 'reabrir') await ordemServicoService.reabrir(id);
            
            notify.success(`Ordem de serviço ${actionText} com sucesso!`);
            loadData(); // Reload list
        } catch (error: any) {
            const message = error.response?.data?.message || `Erro ao ${actionText} ordem de serviço`;
            notify.error(message);
        }
    };

    const filteredOrdens = ordens.filter(os => {
        const term = searchTerm.toLowerCase();
        return (
            os.nomeCliente?.toLowerCase().includes(term) ||
            os.placa?.toLowerCase().includes(term) ||
            os.veiculo?.toLowerCase().includes(term) ||
            os.ordemServicoId?.toString().includes(term)
        );
    });

    const getStatusBadge = (status?: number) => {
        switch (status) {
            case 0: return <span className="status-badge status-0">Aberta</span>;
            case 1: return <span className="status-badge status-1">Finalizada</span>;
            case 2: return <span className="status-badge status-2">Cancelada</span>;
            default: return <span className="status-badge">Desconhecido</span>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="list-container">
            <div className="search-container" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FiSearch className="search-icon" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por cliente, placa, veículo ou número da OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px 12px 48px', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                </div>
                <select 
                    value={statusFilter === undefined ? '' : statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : Number(e.target.value))}
                    style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', minWidth: '150px' }}
                >
                    <option value="">Todos os Status</option>
                    <option value={0}>Abertas</option>
                    <option value={1}>Finalizadas</option>
                    <option value={2}>Canceladas</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state">Carregando ordens de serviço...</div>
            ) : filteredOrdens.length === 0 ? (
                <div className="empty-state">
                    Nenhuma ordem de serviço encontrada.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>OS nº</th>
                                <th>Cliente</th>
                                <th>Veículo / Placa</th>
                                <th>Data Abertura</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th style={{ width: '140px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrdens.map((os) => (
                                <tr key={os.ordemServicoId}>
                                    <td><strong>#{os.ordemServicoId}</strong></td>
                                    <td>{os.nomeCliente}</td>
                                    <td>{os.veiculo} {os.placa ? `(${os.placa})` : ''}</td>
                                    <td>{formatDate(os.dataAbertura)}</td>
                                    <td>{getStatusBadge(os.status)}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--blue)' }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.valorTotal || 0)}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {os.status === 0 && (
                                                <>
                                                    <button 
                                                        className="btn-icon" 
                                                        title="Finalizar"
                                                        style={{ color: '#198754' }}
                                                        onClick={() => os.ordemServicoId && handleAction(os.ordemServicoId, 'finalizar')}
                                                    >
                                                        <FiCheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        className="btn-icon btn-delete" 
                                                        title="Cancelar"
                                                        onClick={() => os.ordemServicoId && handleAction(os.ordemServicoId, 'cancelar')}
                                                    >
                                                        <FiXCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {os.status === 2 && (
                                                <button 
                                                    className="btn-icon" 
                                                    title="Reabrir"
                                                    style={{ color: '#0d6efd' }}
                                                    onClick={() => os.ordemServicoId && handleAction(os.ordemServicoId, 'reabrir')}
                                                >
                                                    <FiRefreshCcw size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ListaOrdemServico;
