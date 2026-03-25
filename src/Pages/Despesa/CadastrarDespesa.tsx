import { useState } from 'react';
import { despesaService, type Despesa } from '../../Services/despesaService';
import { notify } from '../../Lib/notify';

function CadastrarDespesa() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Despesa>({
        nomeDespesa: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nomeDespesa) {
            notify.error('Nome da despesa é obrigatório');
            return;
        }

        setLoading(true);
        try {
            await despesaService.cadastrar(formData);
            notify.success('Despesa cadastrada com sucesso!');
 
            setFormData({
                nomeDespesa: ''
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar despesa';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <form onSubmit={handleSubmit}>
                <div className="standard-form-header">
                    <h2>Nova Despesa</h2>
                    <p>Preencha os dados abaixo para cadastrar uma nova despesa no sistema.</p>
                </div>
                
                <div className="standard-form-grid">
                    <div className="standard-form-group">
                        <label htmlFor="nomeDespesa">Nome da Despesa *</label>
                        <input 
                            type="text" 
                            id="nomeDespesa" 
                            placeholder="Ex: Energia Elétrica, Internet, Aluguel" 
                            value={formData.nomeDespesa}
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
                        {loading ? 'Salvando...' : 'Salvar Despesa'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarDespesa;