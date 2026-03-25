import { useState, useEffect } from 'react';
import '../../Styles/Servico/servico.css';
import { servicoService, type Servico } from '../../Services/servicoService';
import { FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import { notify } from '../../Lib/notify';

function ListaServico() {
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Editing States
    const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Servico | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchServicos = async () => {
        try {
            const data = await servicoService.listar();
            setServicos(data);
        } catch (error) {
            notify.error('Erro ao carregar serviços');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicos();
    }, []);

    // Filter logic
    const filteredServicos = servicos.filter(servico => 
        servico.nomeServico.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;

        try {
            await servicoService.excluir(id);
            notify.success('Serviço excluído com sucesso');
            fetchServicos(); // Refresh list
            if (isModalOpen) closeModal(); // Close modal if open
        } catch (error) {
            notify.error('Erro ao excluir serviço');
            console.error(error);
        }
    };

    const openModal = (servico: Servico) => {
        setSelectedServico(servico);
        setEditForm(servico);
        setIsEditing(false); // Start in view mode
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedServico(null);
        setEditForm(null);
        setIsEditing(false);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editForm) {
            const { id, value } = e.target;
            setEditForm({ 
                ...editForm, 
                [id]: id === 'valorServico' ? parseFloat(value) || 0 : value 
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm || !editForm.servicoId) return;

        setSaving(true);
        try {
            await servicoService.atualizar(editForm.servicoId, editForm);
            notify.success('Serviço atualizado com sucesso!');
            fetchServicos(); // Refresh list
            setSelectedServico(editForm); // Update view mode
            setIsEditing(false); // Switch back to view mode
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao atualizar serviço';
            notify.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="form-container" style={{ textAlign: 'center', padding: 60 }}>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="search-container">
                <FiSearch className="search-icon" size={20} />
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Buscar por nome do serviço..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredServicos.length > 0 ? (
                <table className="servico-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>Nome</th>
                            <th style={{ width: '40%' }}>Descrição</th>
                            <th style={{ width: '15%' }}>Valor</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServicos.map((servico) => (
                            <tr key={servico.servicoId}>
                                <td>{servico.nomeServico}</td>
                                <td>{servico.descricaoServico || '-'}</td>
                                <td>R$ {servico.valorServico.toFixed(2).replace('.', ',')}</td>
                                <td className="actions-cell">
                                    <button 
                                        className="action-btn edit" 
                                        onClick={() => openModal(servico)}
                                        title="Editar"
                                    >
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button 
                                        className="action-btn delete" 
                                        onClick={() => servico.servicoId && handleDelete(servico.servicoId)}
                                        title="Excluir"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
                    <p>Nenhum serviço encontrado.</p>
                </div>
            )}

            {/* Modal de Detalhes/Edição */}
            {isModalOpen && selectedServico && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Editar Serviço' : 'Detalhes do Serviço'}</h2>
                            <button className="close-modal" onClick={closeModal}>&times;</button>
                        </div>
                        
                        {isEditing ? (
                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
                                        <div className="form-group">
                                            <label htmlFor="nomeServico">Nome do Serviço *</label>
                                            <input 
                                                type="text" 
                                                id="nomeServico" 
                                                value={editForm?.nomeServico}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="descricaoServico">Descrição</label>
                                            <textarea 
                                                id="descricaoServico" 
                                                value={editForm?.descricaoServico}
                                                onChange={handleEditChange}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="valorServico">Valor (R$) *</label>
                                            <input 
                                                type="number" 
                                                id="valorServico" 
                                                value={editForm?.valorServico}
                                                onChange={handleEditChange}
                                                step="0.01"
                                                min="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
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
                            <>
                                <div className="modal-body">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>NOME DO SERVIÇO</label>
                                            <div style={{ fontSize: '16px', fontWeight: 500 }}>{selectedServico.nomeServico}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>DESCRIÇÃO</label>
                                            <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{selectedServico.descricaoServico || '-'}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>VALOR</label>
                                            <div style={{ fontSize: '16px', fontWeight: 500, color: '#28a745' }}>
                                                R$ {selectedServico.valorServico.toFixed(2).replace('.', ',')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        className="btn-secondary" 
                                        onClick={closeModal}
                                    >
                                        Fechar
                                    </button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={() => setIsEditing(true)}
                                    >
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

export default ListaServico;
