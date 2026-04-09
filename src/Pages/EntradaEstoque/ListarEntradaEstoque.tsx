import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiEye, FiX, FiPackage } from 'react-icons/fi';
import { entradaEstoqueService, type EntradaEstoqueDTO } from '../../Services/entradaEstoqueService';
import { notify } from '../../Lib/notify';
import '../../Styles/EntradaEstoque/entradaEstoque.css';

function ListarEntradaEstoque() {
    const [entradas, setEntradas] = useState<EntradaEstoqueDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedEntrada, setSelectedEntrada] = useState<EntradaEstoqueDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEntradas = async () => {
        try {
            const data = await entradaEstoqueService.listar();
            setEntradas(data);
        } catch (error) {
            notify.error('Erro ao carregar entradas de estoque');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEntradas(); }, []);

    const filtradas = entradas.filter(e =>
        (e.produto ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(e.estoqueId).includes(searchTerm)
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Deseja excluir esta entrada de estoque?')) return;
        try {
            await entradaEstoqueService.excluir(id);
            notify.success('Entrada excluída com sucesso');
            fetchEntradas();
            if (isModalOpen) closeModal();
        } catch (error) {
            notify.error('Erro ao excluir entrada');
        }
    };

    const openModal = (entrada: EntradaEstoqueDTO) => {
        setSelectedEntrada(entrada);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEntrada(null);
    };

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
                <h2>Histórico de Entradas</h2>
                <p>Todas as entradas de estoque registradas no sistema.</p>
            </div>

            <div className="search-container">
                <FiSearch className="search-icon" size={20} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Pesquisar por produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {entradas.length === 0 ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#888',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    border: '1px dashed #e0e0e0',
                }}>
                    <p>Nenhuma entrada de estoque registrada.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>Nº</th>
                                <th style={{ width: '45%' }}>Produto</th>
                                <th style={{ width: '20%', textAlign: 'center' }}>Quantidade</th>
                                <th style={{ width: '15%' }}>Data</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((entrada) => (
                                <tr key={entrada.estoqueId}>
                                    <td><strong>#{entrada.estoqueId}</strong></td>
                                    <td style={{ color: '#111827', fontWeight: 500 }}>{entrada.produto}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="estoque-qty-badge">{entrada.quantidadeProduto} un.</span>
                                    </td>
                                    <td>{formatDate(entrada.dataEntrada)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="actions-cell">
                                            <button
                                                className="action-btn edit"
                                                title="Ver detalhes"
                                                onClick={() => openModal(entrada)}
                                            >
                                                <FiEye size={18} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                title="Excluir"
                                                onClick={() => handleDelete(entrada.estoqueId)}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtradas.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                                        Nenhuma entrada encontrada para sua pesquisa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de detalhe */}
            {isModalOpen && selectedEntrada && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="modal-content" style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiPackage size={20} />
                                Entrada #{selectedEntrada.estoqueId}
                            </h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Produto</label>
                                <div className="view-field">{selectedEntrada.produto}</div>
                            </div>
                            <div className="form-group">
                                <label>Quantidade Entrada</label>
                                <div className="view-field" style={{ fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>
                                    {selectedEntrada.quantidadeProduto} unidades
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Data de Entrada</label>
                                <div className="view-field">{formatDate(selectedEntrada.dataEntrada)}</div>
                            </div>
                        </div>

                        <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: 24 }}>
                            <button
                                className="btn-danger"
                                onClick={() => handleDelete(selectedEntrada.estoqueId)}
                            >
                                <FiTrash2 style={{ marginRight: 8 }} />
                                Excluir Entrada
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

export default ListarEntradaEstoque;
