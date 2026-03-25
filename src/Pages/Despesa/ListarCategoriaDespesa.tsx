import { useState, useEffect } from 'react';
import '../../Styles/Despesa/despesa.css';
import '../../Styles/OrdemServico/OrdemServico/ordemServico.css';
import { categoriaDespesaService, type CategoriaDespesa } from '../../Services/despesaService';
import { FiTrash2, FiEdit2, FiSearch, FiX, FiEye } from 'react-icons/fi';
import { notify } from '../../Lib/notify';

function ListaCategoriaDespesa() {
    const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedCategoria, setSelectedCategoria] = useState<CategoriaDespesa | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<CategoriaDespesa | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchCategorias = async () => {
        try {
            const data = await categoriaDespesaService.listar();
            setCategorias(data);
        } catch (error) {
            notify.error('Erro ao carregar categorias');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    // Filter logic
    const filteredCategorias = categorias.filter(categoria => 
        categoria.nomeCategoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

        try {
            await categoriaDespesaService.desativar(id);
            notify.success('Categoria excluída com sucesso');
            fetchCategorias(); // Refresh list
            if (isModalOpen) closeModal(); // Close modal if open
        } catch (error) {
            notify.error('Erro ao excluir categoria');
        }
    };

    const openModal = (categoria: CategoriaDespesa) => {
        setSelectedCategoria(categoria);
        setEditForm(categoria);
        setIsEditing(false); // Start in view mode
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategoria(null);
        setEditForm(null);
        setIsEditing(false);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editForm) {
            const { id, value } = e.target;
            setEditForm({ ...editForm, [id]: value });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm || !editForm.categoriaId) return;

        setSaving(true);
        try {
            await categoriaDespesaService.atualizar(editForm.categoriaId, editForm);
            notify.success('Categoria atualizada com sucesso!');
            fetchCategorias(); // Refresh list
            setSelectedCategoria(editForm); // Update view mode
            setIsEditing(false); // Switch back to view mode
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar categoria';
            notify.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="standard-list-container standard-list-loading">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="standard-list-container">
            <div className="standard-list-header">
                <h2>Categorias de Despesa Cadastradas</h2>
            </div>

            {/* Search Bar */}
            <div className="standard-list-search">
                <FiSearch />
                <input 
                    type="text" 
                    placeholder="Pesquisar por nome da categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {categorias.length === 0 ? (
                <div className="standard-list-empty">
                    <p>Nenhuma categoria cadastrada no momento.</p>
                </div>
            ) : (
                <div className="standard-list-table-wrapper">
                    <table className="standard-list-table">
                        <thead>
                            <tr>
                                <th>Nome da Categoria</th>
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
                                                className="view" 
                                                title="Visualizar/Editar"
                                                onClick={() => openModal(categoria)}
                                            >
                                                <FiEye size={20} />
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
                            {filteredCategorias.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="standard-list-table-empty">
                                        Nenhuma categoria encontrada para sua pesquisa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedCategoria && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Categoria' : 'Detalhes da Categoria'}</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        {isEditing ? (
                            // Edit Form
                            <form onSubmit={handleUpdate}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="nomeCategoria">Nome da Categoria *</label>
                                        <input 
                                            type="text" 
                                            id="nomeCategoria" 
                                            value={editForm?.nomeCategoria} 
                                            onChange={handleEditChange} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // Read-only View
                            <>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nome da Categoria</label>
                                        <div className="standard-view-field">
                                            {selectedCategoria.nomeCategoria}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions standard-list-modal-actions">
                                    <button 
                                        className="btn-danger" 
                                        onClick={() => selectedCategoria.categoriaId && handleDelete(selectedCategoria.categoriaId)}
                                    >
                                        <FiTrash2 style={{ marginRight: 8 }} />
                                        Excluir Categoria
                                    </button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <FiEdit2 style={{ marginRight: 8 }} />
                                        Editar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaCategoriaDespesa;
