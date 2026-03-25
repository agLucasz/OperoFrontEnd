import { useState } from 'react';
import '../../Styles/Cliente/cliente.css';
import { clienteService, type Cliente } from '../../Services/clienteService';
import { notify } from '../../Lib/notify';

function CadastrarCliente() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Cliente>({
        nome: '',
        email: '',
        telefone: '',
        documento: '',
        endereco: '',
        bairro: '',
        cep: '',
        cidade: '',
        uf: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nome || !formData.documento) {
            notify.error('Nome e Documento são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            await clienteService.cadastrar(formData);
            notify.success('Cliente cadastrado com sucesso!');
 
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                documento: '',
                endereco: '',
                bairro: '',
                cep: '',
                cidade: '',
                uf: ''
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar cliente';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <div className="cliente-header" style={{ marginBottom: 32 }}>
                <h2>Novo Cliente</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group field-nome">
                        <label htmlFor="nome">Nome Completo *</label>
                        <input 
                            type="text" 
                            id="nome" 
                            placeholder="Ex: João da Silva" 
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group field-documento">
                        <label htmlFor="documento">CPF/CNPJ *</label>
                        <input 
                            type="text" 
                            id="documento" 
                            placeholder="Digite o documento" 
                            value={formData.documento}
                            onChange={handleChange}
                            maxLength={18}
                            required
                        />
                    </div>

                    <div className="form-group field-telefone">
                        <label htmlFor="telefone">Telefone</label>
                        <input 
                            type="tel" 
                            id="telefone" 
                            placeholder="Ex: (11) 99999-9999" 
                            value={formData.telefone}
                            onChange={handleChange}
                            maxLength={12}
                        />
                    </div>

                    <div className="form-group field-cep">
                        <label htmlFor="cep">CEP</label>
                        <input 
                            type="text" 
                            id="cep" 
                            placeholder="00000-000" 
                            value={formData.cep}
                            onChange={handleChange}
                            maxLength={9}
                        />
                    </div>

                    <div className="form-group field-endereco">
                        <label htmlFor="endereco">Endereço</label>
                        <input 
                            type="text" 
                            id="endereco" 
                            placeholder="Rua, número, complemento" 
                            value={formData.endereco}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group field-bairro">
                        <label htmlFor="bairro">Bairro</label>
                        <input 
                            type="text" 
                            id="bairro" 
                            placeholder="Bairro" 
                            value={formData.bairro}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group field-cidade">
                        <label htmlFor="cidade">Cidade</label>
                        <input 
                            type="text" 
                            id="cidade" 
                            placeholder="Cidade" 
                            value={formData.cidade}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group field-uf">
                        <label htmlFor="uf">UF</label>
                        <input 
                            type="text" 
                            id="uf" 
                            placeholder="UF" 
                            maxLength={2}
                            style={{ textTransform: 'uppercase' }}
                            value={formData.uf}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="form-group field-email">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            placeholder="Ex: joao@email.com" 
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => window.location.reload()} // Simple reset or navigation could be handled by parent
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarCliente;
