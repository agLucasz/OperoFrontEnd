import { useState, useEffect } from 'react';
import '../../../Styles/Produto/CategoriaProduto/categoriaProduto.css';
import { categoriaProdutoService, type CategoriaProduto } from '../../../Services/categoriaProdutoService';
import { FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import { notify } from '../../../Lib/notify';

function ListaCategoriaProduto() {
    const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedCategoria, setSelectedCategoria] = useState<CategoriaProduto | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        try {
            setLoading(true);
            const data = await categoriaProdutoService.listar();
            setCategorias(data);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            notify.error('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

        try {
            await categoriaProdutoService.excluir(id);
            setCategorias(prev => prev.filter(cat => cat.categoriaId !== id));
            notify.success('Categoria excluída com sucesso');
        } catch (error: any) {
            console.error('Erro ao excluir:', error);
            notify.error('Erro ao excluir categoria');
        }
    };

    const handleEdit = (categoria: CategoriaProduto) => {
        setSelectedCategoria({ ...categoria });
        setIsModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedCategoria || !selectedCategoria.categoriaId) return;

        try {
            await categoriaProdutoService.atualizar(selectedCategoria.categoriaId, selectedCategoria);
            setCategorias(prev => 
                prev.map(cat => cat.categoriaId === selectedCategoria.categoriaId ? selectedCategoria : cat)
            );
            notify.success('Categoria atualizada com sucesso');
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Erro ao atualizar:', error);
            notify.error('Erro ao atualizar categoria');
        }
    };

    const filteredCategorias = categorias.filter(cat => 
        cat.nomeCategoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="standard-list-container">
            <div className="standard-list-header">
                <h2>Categorias de Produto Cadastradas</h2>
            </div>

            <div className="standard-list-search">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Buscar categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="standard-list-container standard-list-loading">Carregando categorias...</div>
            ) : filteredCategorias.length === 0 ? (
                <div className="standard-list-empty">
                    <p>Nenhuma categoria encontrada.</p>
                </div>
            ) : (
                <div className="standard-list-table-wrapper">
                    <table className="standard-list-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th style={{ width: '150px', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategorias.map((categoria) => (
                                <tr key={categoria.categoriaId}>
                                    <td>{categoria.nomeCategoria}</td>
                                    <td>
                                        <div className="standard-list-actions">
                                            <button 
                                                className="edit"
                                                title="Editar"
                                                onClick={() => handleEdit(categoria)}
                                            >
                                                <FiEdit2 size={20} />
                                            </button>
                                            <button 
                                                className="delete"
                                                title="Excluir"
                                                onClick={() => categoria.categoriaId && handleDelete(categoria.categoriaId)}
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {isModalOpen && selectedCategoria && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Categoria</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nome da Categoria</label>
                                <input
                                    type="text"
                                    value={selectedCategoria.nomeCategoria}
                                    onChange={(e) => setSelectedCategoria({ ...selectedCategoria, nomeCategoria: e.target.value })}
                                />
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

export default ListaCategoriaProduto;
