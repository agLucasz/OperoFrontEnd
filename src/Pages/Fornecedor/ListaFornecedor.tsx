import { useState, useEffect } from 'react';
import '../../Styles/Fornecedor/fornecedor.css';
import { fornecedorService, type Fornecedor } from '../../Services/fornecedorService';
import { FiTrash2, FiEdit2, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { notify } from '../../Lib/notify';

function ListaFornecedor() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Fornecedor | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchFornecedores = async () => {
        try {
            const data = await fornecedorService.listar();
            setFornecedores(data);
        } catch (error) {
            notify.error('Erro ao carregar fornecedores');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFornecedores();
    }, []);

    // Filter logic
    const filteredFornecedores = fornecedores.filter(fornecedor => 
        fornecedor.nomeFornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.documentoFornecedor.includes(searchTerm)
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja desativar este fornecedor?')) return;

        try {
            await fornecedorService.desativar(id);
            notify.success('Fornecedor desativado com sucesso');
            fetchFornecedores(); // Refresh list
            if (isModalOpen) closeModal(); // Close modal if open
        } catch (error) {
            notify.error('Erro ao desativar fornecedor');
        }
    };

    const openModal = (fornecedor: Fornecedor) => {
        setSelectedFornecedor(fornecedor);
        setEditForm(fornecedor);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFornecedor(null);
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
        if (!editForm || !editForm.fornecedorId) return;

        setSaving(true);
        try {
            await fornecedorService.atualizar(editForm.fornecedorId, editForm);
            notify.success('Fornecedor atualizado com sucesso!');
            fetchFornecedores(); // Refresh list
            setSelectedFornecedor(editForm); // Update view mode
            setIsEditing(false); // Switch back to view mode
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar fornecedor';
            notify.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="list-container" style={{ textAlign: 'center', padding: 60 }}>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="list-container">
            <div className="fornecedor-header">
                <h2>Fornecedores Cadastrados</h2>
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <FiSearch className="search-icon" size={20} />
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Pesquisar por nome ou documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {fornecedores.length === 0 ? (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#888',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    border: '1px dashed #e0e0e0'
                }}>
                    <p>Nenhum fornecedor cadastrado no momento.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Nome</th>
                                <th style={{ width: '20%' }}>Documento</th>
                                <th style={{ width: '15%' }}>Telefone</th>
                                <th style={{ width: '15%' }}>Cidade</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFornecedores.map((fornecedor) => (
                                <tr key={fornecedor.fornecedorId}>
                                    <td>{fornecedor.nomeFornecedor}</td>
                                    <td>{fornecedor.documentoFornecedor}</td>
                                    <td>{fornecedor.telefoneFornecedor}</td>
                                    <td>{fornecedor.cidadeFornecedor || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="actions-cell">
                                            <button 
                                                className="action-btn edit" 
                                                title="Visualizar Detalhes"
                                                onClick={() => openModal(fornecedor)}
                                            >
                                                <FiEye size={18} />
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                title="Desativar"
                                                onClick={() => fornecedor.fornecedorId && handleDelete(fornecedor.fornecedorId)}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFornecedores.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                                        Nenhum fornecedor encontrado para sua pesquisa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedFornecedor && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Fornecedor' : 'Detalhes do Fornecedor'}</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        {isEditing ? (
                            // Edit Form
                            <form onSubmit={handleUpdate}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="nomeFornecedor">Nome do Fornecedor *</label>
                                        <input 
                                            type="text" 
                                            id="nomeFornecedor" 
                                            value={editForm?.nomeFornecedor} 
                                            onChange={handleEditChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="documentoFornecedor">CNPJ/CPF *</label>
                                        <input 
                                            type="text" 
                                            id="documentoFornecedor" 
                                            value={editForm?.documentoFornecedor} 
                                            onChange={handleEditChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="telefoneFornecedor">Telefone</label>
                                        <input 
                                            type="tel" 
                                            id="telefoneFornecedor" 
                                            value={editForm?.telefoneFornecedor} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cepFornecedor">CEP</label>
                                        <input 
                                            type="text" 
                                            id="cepFornecedor" 
                                            value={editForm?.cepFornecedor} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="enderecoFornecedor">Endereço</label>
                                        <input 
                                            type="text" 
                                            id="enderecoFornecedor" 
                                            value={editForm?.enderecoFornecedor} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="bairroFornecedor">Bairro</label>
                                        <input 
                                            type="text" 
                                            id="bairroFornecedor" 
                                            value={editForm?.bairroFornecedor} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cidadeFornecedor">Cidade</label>
                                        <input 
                                            type="text" 
                                            id="cidadeFornecedor" 
                                            value={editForm?.cidadeFornecedor} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ufFornecedor">UF</label>
                                        <input 
                                            type="text" 
                                            id="ufFornecedor" 
                                            value={editForm?.ufFornecedor} 
                                            onChange={handleEditChange} 
                                            maxLength={2}
                                            style={{ textTransform: 'uppercase' }}
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
                                        <label>Nome do Fornecedor</label>
                                        <div className="view-field">{selectedFornecedor.nomeFornecedor}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>CNPJ/CPF</label>
                                        <div className="view-field">{selectedFornecedor.documentoFornecedor}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Telefone</label>
                                        <div className="view-field">{selectedFornecedor.telefoneFornecedor || '-'}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Endereço</label>
                                        <div className="view-field">
                                            {selectedFornecedor.enderecoFornecedor}, {selectedFornecedor.bairroFornecedor}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Cidade/UF</label>
                                        <div className="view-field">
                                            {selectedFornecedor.cidadeFornecedor}/{selectedFornecedor.ufFornecedor} - CEP: {selectedFornecedor.cepFornecedor}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                                    <button 
                                        className="btn-danger" 
                                        onClick={() => selectedFornecedor.fornecedorId && handleDelete(selectedFornecedor.fornecedorId)}
                                    >
                                        <FiTrash2 style={{ marginRight: 8 }} />
                                        Desativar Fornecedor
                                    </button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <FiEdit2 style={{ marginRight: 8 }} />
                                        Editar Informações
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

export default ListaFornecedor;
