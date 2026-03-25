import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { formaPagamentoService, type FormaPagamento } from '../../Services/formaPagamentoService';
import { notify } from '../../Lib/notify';
import '../../Styles/FormaPagamento/formaPagamento.css';

function ListaFormaPagamento() {
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<FormaPagamento | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchFormasPagamento = async () => {
        try {
            const data = await formaPagamentoService.listar();
            setFormasPagamento(data);
        } catch (error) {
            notify.error('Erro ao carregar formas de pagamento');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFormasPagamento();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
            try {
                await formaPagamentoService.desativar(id);
                notify.success('Forma de pagamento excluída com sucesso');
                fetchFormasPagamento();
            } catch (error) {
                notify.error('Erro ao excluir forma de pagamento');
                console.error(error);
            }
        }
    };

    const handleEdit = (formaPagamento: FormaPagamento) => {
        setSelectedFormaPagamento({ ...formaPagamento });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFormaPagamento || !selectedFormaPagamento.formaPagamentoId) return;

        if (!selectedFormaPagamento.descricaoPagamento) {
            notify.error('A descrição da forma de pagamento é obrigatória');
            return;
        }

        setIsSaving(true);
        try {
            await formaPagamentoService.atualizar(selectedFormaPagamento.formaPagamentoId, selectedFormaPagamento);
            notify.success('Forma de pagamento atualizada com sucesso');
            setIsEditModalOpen(false);
            fetchFormasPagamento();
        } catch (error) {
            notify.error('Erro ao atualizar forma de pagamento');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (selectedFormaPagamento) {
            setSelectedFormaPagamento({
                ...selectedFormaPagamento,
                [name]: value
            });
        }
    };

    const filteredFormasPagamento = formasPagamento.filter(forma => 
        forma.descricaoPagamento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="standard-list-container" style={{ textAlign: 'center' }}>Carregando formas de pagamento...</div>;
    }

    return (
        <div className="standard-list-container">
            <div className="standard-list-header">
                <h2>Formas de Pagamento Cadastradas</h2>
            </div>

            <div className="standard-list-search">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Buscar formas de pagamento por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="standard-list-table-wrapper">
                <table className="standard-list-table">
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th style={{ textAlign: 'center', width: '150px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFormasPagamento.length > 0 ? (
                            filteredFormasPagamento.map((forma) => (
                                <tr key={forma.formaPagamentoId}>
                                    <td>{forma.descricaoPagamento}</td>
                                    <td>
                                        <div className="standard-list-actions">
                                            <button 
                                                className="edit" 
                                                title="Editar"
                                                onClick={() => handleEdit(forma)}
                                            >
                                                <FiEdit2 size={20} />
                                            </button>
                                            <button 
                                                className="delete" 
                                                title="Excluir"
                                                onClick={() => forma.formaPagamentoId && handleDelete(forma.formaPagamentoId)}
                                            >
                                                <FiTrash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                    Nenhuma forma de pagamento encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Edição */}
            {isEditModalOpen && selectedFormaPagamento && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Forma de Pagamento</h2>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="edit-descricao">Descrição da Forma de Pagamento *</label>
                                    <input
                                        type="text"
                                        id="edit-descricao"
                                        name="descricaoPagamento"
                                        value={selectedFormaPagamento.descricaoPagamento}
                                        onChange={handleEditChange}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-secondary"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaFormaPagamento;
