import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiTrash2, FiX, FiShoppingCart } from 'react-icons/fi';
import { vendaService, type VendaDTO } from '../../Services/vendaService';
import { notify } from '../../Lib/notify';
import '../../Styles/Venda/venda.css';

function ListarVenda() {
    const [vendas, setVendas] = useState<VendaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [selectedVenda, setSelectedVenda] = useState<VendaDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchVendas = async () => {
        try {
            const data = await vendaService.listar();
            setVendas(data);
        } catch (error) {
            notify.error('Erro ao carregar vendas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    const filteredVendas = vendas.filter(venda =>
        String(venda.vendaId).includes(searchTerm) ||
        new Date(venda.dtVenda).toLocaleDateString('pt-BR').includes(searchTerm)
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return;
        try {
            await vendaService.excluir(id);
            notify.success('Venda excluída com sucesso');
            fetchVendas();
            if (isModalOpen) closeModal();
        } catch (error) {
            notify.error('Erro ao excluir venda');
        }
    };

    const openModal = (venda: VendaDTO) => {
        setSelectedVenda(venda);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVenda(null);
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatDate = (dateStr: string) =>
        new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('pt-BR');

    if (loading) {
        return (
            <div className="list-container" style={{ textAlign: 'center', padding: 60 }}>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="list-container">
            <div className="venda-header">
                <h2>Histórico de Vendas</h2>
                <p>Consulte todas as vendas realizadas no sistema.</p>
            </div>

            {/* Search */}
            <div className="search-container">
                <FiSearch className="search-icon" size={20} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Pesquisar por nº da venda ou data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {vendas.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#888',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    border: '1px dashed #e0e0e0'
                }}>
                    <p>Nenhuma venda registrada no momento.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Nº Venda</th>
                                <th style={{ width: '20%' }}>Data</th>
                                <th style={{ width: '20%' }}>Qtd. Itens</th>
                                <th style={{ width: '30%' }}>Total</th>
                                <th style={{ width: '20%', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendas.map((venda) => (
                                <tr key={venda.vendaId}>
                                    <td><strong>#{venda.vendaId}</strong></td>
                                    <td>{formatDate(venda.dtVenda)}</td>
                                    <td>{venda.itens?.length ?? 0} {(venda.itens?.length ?? 0) === 1 ? 'item' : 'itens'}</td>
                                    <td>
                                        <span className="venda-total-badge">
                                            {formatCurrency(venda.valorTotal)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="actions-cell">
                                            <button
                                                className="action-btn edit"
                                                title="Ver detalhes"
                                                onClick={() => openModal(venda)}
                                            >
                                                <FiEye size={18} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                title="Excluir venda"
                                                onClick={() => handleDelete(venda.vendaId)}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredVendas.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                                        Nenhuma venda encontrada para sua pesquisa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedVenda && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <div className="modal-content" style={{ maxWidth: 680 }}>
                        <div className="modal-header">
                            <h2>
                                <FiShoppingCart style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                Venda #{selectedVenda.vendaId}
                            </h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nº da Venda</label>
                                <div className="view-field">#{selectedVenda.vendaId}</div>
                            </div>
                            <div className="form-group">
                                <label>Data da Venda</label>
                                <div className="view-field">{formatDate(selectedVenda.dtVenda)}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 8 }}>
                            <label style={{ fontSize: 14, fontWeight: 500, color: '#4b5563' }}>
                                Itens da Venda
                            </label>
                            <div className="venda-detail-items">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th style={{ textAlign: 'center' }}>Qtd.</th>
                                            <th style={{ textAlign: 'right' }}>Vlr. Unit.</th>
                                            <th style={{ textAlign: 'right' }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedVenda.itens?.map((item) => (
                                            <tr key={item.vendaItemId}>
                                                <td>{item.produto}</td>
                                                <td style={{ textAlign: 'center' }}>{item.quantidadeItem}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.valorUnitario)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.valorTotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, padding: '10px 14px', fontSize: 14 }}>
                                                Total:
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, padding: '10px 14px', color: 'var(--green)', fontSize: 16 }}>
                                                {formatCurrency(selectedVenda.valorTotal)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: 24 }}>
                            <button
                                className="btn-danger"
                                onClick={() => handleDelete(selectedVenda.vendaId)}
                            >
                                <FiTrash2 style={{ marginRight: 8 }} />
                                Excluir Venda
                            </button>
                            <button className="btn-secondary" onClick={closeModal}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListarVenda;
