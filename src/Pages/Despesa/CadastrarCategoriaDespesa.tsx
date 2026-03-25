import { useState } from 'react';
import { categoriaDespesaService, type CategoriaDespesa } from '../../Services/despesaService';
import { notify } from '../../Lib/notify';

function CadastrarCategoriaDespesa() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CategoriaDespesa>({
        nomeCategoria: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nomeCategoria) {
            notify.error('Nome da categoria é obrigatório');
            return;
        }

        setLoading(true);
        try {
            await categoriaDespesaService.cadastrar(formData);
            notify.success('Categoria cadastrada com sucesso!');
 
            setFormData({
                nomeCategoria: ''
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar categoria';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <form onSubmit={handleSubmit}>
                <div className="standard-form-header">
                    <h2>Nova Categoria de Despesa</h2>
                    <p>Preencha os dados abaixo para cadastrar uma nova categoria de despesa no sistema.</p>
                </div>
                
                <div className="standard-form-grid">
                    <div className="standard-form-group">
                        <label htmlFor="nomeCategoria">Nome da Categoria *</label>
                        <input 
                            type="text" 
                            id="nomeCategoria" 
                            placeholder="Ex: Alimentação, Transporte, Escritório" 
                            value={formData.nomeCategoria}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="standard-form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => window.location.reload()} 
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarCategoriaDespesa;
