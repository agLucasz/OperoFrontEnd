import { useState, useEffect } from 'react';
import '../../Styles/Despesa/despesa.css';
import '../../Styles/OrdemServico/OrdemServico/ordemServico.css';
import { despesaService, type Despesa } from '../../Services/despesaService';
import { FiTrash2, FiEdit2, FiSearch, FiX, FiEye } from 'react-icons/fi';
import { notify } from '../../Lib/notify';

function ListaDespesa() {
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Despesa | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchDespesas = async () => {
        try {
            const data = await despesaService.listar();
            setDespesas(data);
        } catch (error) {
            notify.error('Erro ao carregar despesas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDespesas();
    }, []);

    // Filter logic
    const filteredDespesas = despesas.filter(despesa => 
        despesa.nomeDespesa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

        try {
            await despesaService.desativar(id);
            notify.success('Despesa excluída com sucesso');
            fetchDespesas(); // Refresh list
            if (isModalOpen) closeModal(); // Close modal if open
        } catch (error) {
            notify.error('Erro ao excluir despesa');
        }
    };

    const openModal = (despesa: Despesa) => {
        setSelectedDespesa(despesa);
        setEditForm(despesa);
        setIsEditing(false); // Start in view mode
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDespesa(null);
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
        if (!editForm || !editForm.despesaId) return;

        setSaving(true);
        try {
            await despesaService.atualizar(editForm.despesaId, editForm);
            notify.success('Despesa atualizada com sucesso!');
            fetchDespesas(); // Refresh list
            setSelectedDespesa(editForm); // Update view mode
            setIsEditing(false); // Switch back to view mode
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar despesa';
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
                <h2>Despesas Cadastradas</h2>
            </div>

            <div className="standard-list-search">
                <FiSearch />
                <input 
                    type="text" 
                    placeholder="Buscar por nome..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="standard-list-table-wrapper">
                <table className="standard-list-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome da Despesa</th>
                            <th style={{ width: '150px', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDespesas.length > 0 ? (
                            filteredDespesas.map(despesa => (
                                <tr key={despesa.despesaId}>
                                    <td>{despesa.despesaId}</td>
                                    <td>{despesa.nomeDespesa}</td>
                                    <td>
                                        <div className="standard-list-actions">
                                            <button 
                                                className="view" 
                                                onClick={() => openModal(despesa)}
                                                title="Visualizar/Editar"
                                            >
                                                <FiEye size={20} />
                                            </button>
                                            <button 
                                                className="delete" 
                                                onClick={() => despesa.despesaId && handleDelete(despesa.despesaId)}
                                                title="Excluir"
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="standard-list-table-empty">
                                    Nenhuma despesa encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for View/Edit */}
            {isModalOpen && selectedDespesa && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>
                                {isEditing ? 'Editar Despesa' : 'Detalhes da Despesa'}
                            </h2>
                            <div className="modal-header-actions">
                                {!isEditing && (
                                    <button 
                                        className="btn-icon" 
                                        onClick={() => setIsEditing(true)}
                                        title="Editar"
                                    >
                                        <FiEdit2 size={20} />
                                    </button>
                                )}
                                <button className="btn-close" onClick={closeModal}>
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="modal-body">
                            {isEditing && editForm ? (
                                <form onSubmit={handleUpdate} id="editForm">
                                    <div className="form-group">
                                        <label htmlFor="nomeDespesa">Nome da Despesa *</label>
                                        <input 
                                            type="text" 
                                            id="nomeDespesa" 
                                            value={editForm.nomeDespesa}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>
                                </form>
                            ) : (
                                <div className="details-grid">
                                    <div className="form-group">
                                        <label>Código</label>
                                        <div className="standard-view-field">{selectedDespesa.despesaId}</div>
                                    </div>
                                    <div className="form-group standard-margin-top">
                                        <label>Nome da Despesa</label>
                                        <div className="standard-view-field">{selectedDespesa.nomeDespesa}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditForm(selectedDespesa); // Reset form
                                    }}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    form="editForm"
                                    className="btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaDespesa;