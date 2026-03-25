import { useState, useEffect } from 'react';
import '../../../Styles/Produto/Produto/produto.css';
import { produtoService, type Produto } from '../../../Services/produtoService';
import { categoriaProdutoService, type CategoriaProduto } from '../../../Services/categoriaProdutoService';
import { FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import { notify } from '../../../Lib/notify';

function ListaProduto() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [produtosData, categoriasData] = await Promise.all([
                produtoService.listar(),
                categoriaProdutoService.listar()
            ]);
            setProdutos(produtosData);
            setCategorias(categoriasData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            notify.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            await produtoService.excluir(id);
            setProdutos(prev => prev.filter(p => p.produtoId !== id));
            notify.success('Produto excluído com sucesso');
        } catch (error: any) {
            console.error('Erro ao excluir:', error);
            notify.error('Erro ao excluir produto');
        }
    };

    const handleEdit = (produto: Produto) => {
        setSelectedProduto({ ...produto });
        setIsModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedProduto || !selectedProduto.produtoId) return;

        try {
            await produtoService.atualizar(selectedProduto.produtoId, selectedProduto);
            

            await loadData();
            
            notify.success('Produto atualizado com sucesso');
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Erro ao atualizar:', error);
            notify.error('Erro ao atualizar produto');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const filteredProdutos = produtos.filter(p => 
        p.nomeProduto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigoProduto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nomeCategoria && p.nomeCategoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="list-container">
            <div className="search-container">
                <FiSearch className="search-icon" size={20} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por nome, código ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading-state">Carregando produtos...</div>
            ) : filteredProdutos.length === 0 ? (
                <div className="empty-state">
                    Nenhum produto encontrado.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Qtd</th>
                                <th>Preço Compra</th>
                                <th>Preço Venda</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProdutos.map((produto) => (
                                <tr key={produto.produtoId}>
                                    <td>{produto.codigoProduto}</td>
                                    <td>{produto.nomeProduto}</td>
                                    <td>{produto.nomeCategoria || 'Sem categoria'}</td>
                                    <td>{produto.quantidadeProduto}</td>
                                    <td>{formatCurrency(produto.precoCompra)}</td>
                                    <td>{formatCurrency(produto.precoVenda)}</td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn edit"
                                            title="Editar"
                                            onClick={() => handleEdit(produto)}
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button 
                                            className="action-btn delete"
                                            title="Excluir"
                                            onClick={() => produto.produtoId && handleDelete(produto.produtoId)}
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {isModalOpen && selectedProduto && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Produto</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nome do Produto</label>
                                    <input
                                        type="text"
                                        value={selectedProduto.nomeProduto}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, nomeProduto: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Código do Produto</label>
                                    <input
                                        type="text"
                                        value={selectedProduto.codigoProduto}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, codigoProduto: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Categoria</label>
                                    <select
                                        value={selectedProduto.categoriaId || ""}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, categoriaId: Number(e.target.value) || 0 })}
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categorias.map((cat, index) => (
                                            <option key={cat.categoriaId || `cat-${index}`} value={cat.categoriaId}>
                                                {cat.nomeCategoria}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quantidade</label>
                                    <input
                                        type="number"
                                        value={selectedProduto.quantidadeProduto}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, quantidadeProduto: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preço Compra</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selectedProduto.precoCompra}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, precoCompra: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preço Venda</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={selectedProduto.precoVenda}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, precoVenda: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Descrição</label>
                                    <textarea
                                        value={selectedProduto.descricaoProduto || ''}
                                        onChange={(e) => setSelectedProduto({ ...selectedProduto, descricaoProduto: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSaveEdit}>Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaProduto;
