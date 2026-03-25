import { useState, useEffect } from 'react';
import '../../Styles/Cliente/cliente.css';
import { clienteService, type Cliente } from '../../Services/clienteService';
import { FiTrash2, FiEdit2, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { notify } from '../../Lib/notify';

function ListaCliente() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Cliente | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchClientes = async () => {
        try {
            const data = await clienteService.listar();
            setClientes(data);
        } catch (error) {
            notify.error('Erro ao carregar clientes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    // Filter logic
    const filteredClientes = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documento.includes(searchTerm)
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja desativar este cliente?')) return;

        try {
            await clienteService.desativar(id);
            notify.success('Cliente desativado com sucesso');
            fetchClientes(); // Refresh list
            if (isModalOpen) closeModal(); // Close modal if open
        } catch (error) {
            notify.error('Erro ao desativar cliente');
        }
    };

    const openModal = (cliente: Cliente) => {
        setSelectedCliente(cliente);
        setEditForm(cliente);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
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
        if (!editForm || !editForm.clienteId) return;

        setSaving(true);
        try {
            await clienteService.atualizar(editForm.clienteId, editForm);
            notify.success('Cliente atualizado com sucesso!');
            fetchClientes(); // Refresh list
            setSelectedCliente(editForm); // Update view mode
            setIsEditing(false); // Switch back to view mode
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar cliente';
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
            <div className="cliente-header">
                <h2>Clientes Cadastrados</h2>
                <p>Gerencie sua base de clientes.</p>
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
            
            {clientes.length === 0 ? (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#888',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    border: '1px dashed #e0e0e0'
                }}>
                    <p>Nenhum cliente cadastrado no momento.</p>
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
                            {filteredClientes.map((cliente) => (
                                <tr key={cliente.clienteId}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.documento}</td>
                                    <td>{cliente.telefone}</td>
                                    <td>{cliente.cidade || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="actions-cell">
                                            <button 
                                                className="action-btn edit" 
                                                title="Visualizar Detalhes"
                                                onClick={() => openModal(cliente)}
                                            >
                                                <FiEye size={18} />
                                            </button>
                                            <button 
                                                className="action-btn delete" 
                                                title="Desativar"
                                                onClick={() => cliente.clienteId && handleDelete(cliente.clienteId)}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClientes.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                                        Nenhum cliente encontrado para sua pesquisa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedCliente && (
                <div className="modal-overlay" onClick={(e) => {
                    if (e.target === e.currentTarget) closeModal();
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Cliente' : 'Detalhes do Cliente'}</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <FiX size={24} />
                            </button>
                        </div>

                        {isEditing ? (
                            // Edit Form
                            <form onSubmit={handleUpdate}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="nome">Nome Completo *</label>
                                        <input 
                                            type="text" 
                                            id="nome" 
                                            value={editForm?.nome} 
                                            onChange={handleEditChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="documento">CPF/CNPJ *</label>
                                        <input 
                                            type="text" 
                                            id="documento" 
                                            value={editForm?.documento} 
                                            onChange={handleEditChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            value={editForm?.email} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="telefone">Telefone</label>
                                        <input 
                                            type="tel" 
                                            id="telefone" 
                                            value={editForm?.telefone} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cep">CEP</label>
                                        <input 
                                            type="text" 
                                            id="cep" 
                                            value={editForm?.cep} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="endereco">Endereço</label>
                                        <input 
                                            type="text" 
                                            id="endereco" 
                                            value={editForm?.endereco} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="bairro">Bairro</label>
                                        <input 
                                            type="text" 
                                            id="bairro" 
                                            value={editForm?.bairro} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cidade">Cidade</label>
                                        <input 
                                            type="text" 
                                            id="cidade" 
                                            value={editForm?.cidade} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="uf">UF</label>
                                        <input 
                                            type="text" 
                                            id="uf" 
                                            value={editForm?.uf} 
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
                                        <label>Nome Completo</label>
                                        <div className="view-field">{selectedCliente.nome}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>CPF/CNPJ</label>
                                        <div className="view-field">{selectedCliente.documento}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <div className="view-field">{selectedCliente.email || '-'}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Telefone</label>
                                        <div className="view-field">{selectedCliente.telefone || '-'}</div>
                                    </div>
                                    <div className="form-group">
                                        <label>Endereço</label>
                                        <div className="view-field">
                                            {selectedCliente.endereco}, {selectedCliente.bairro}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Cidade/UF</label>
                                        <div className="view-field">
                                            {selectedCliente.cidade}/{selectedCliente.uf} - CEP: {selectedCliente.cep}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                                    <button 
                                        className="btn-danger" 
                                        onClick={() => selectedCliente.clienteId && handleDelete(selectedCliente.clienteId)}
                                    >
                                        <FiTrash2 style={{ marginRight: 8 }} />
                                        Desativar Cliente
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

export default ListaCliente;
