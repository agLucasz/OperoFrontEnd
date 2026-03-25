import { useState } from 'react';
import '../../Styles/Fornecedor/fornecedor.css'
import { fornecedorService, type Fornecedor } from '../../Services/fornecedorService';
import { notify } from '../../Lib/notify';

function CadastrarFornecedor() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Fornecedor>({
        nomeFornecedor: '',
        documentoFornecedor: '',
        telefoneFornecedor: '',
        enderecoFornecedor: '',
        bairroFornecedor: '',
        cepFornecedor: '',
        cidadeFornecedor: '',
        ufFornecedor: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nomeFornecedor || !formData.documentoFornecedor) {
            notify.error('Nome e Documento são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            await fornecedorService.cadastrar(formData);
            notify.success('Fornecedor cadastrado com sucesso!');
 
            setFormData({
                nomeFornecedor: '',
                documentoFornecedor: '',
                telefoneFornecedor: '',
                enderecoFornecedor: '',
                bairroFornecedor: '',
                cepFornecedor: '',
                cidadeFornecedor: '',
                ufFornecedor: ''
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cadastrar fornecedor';
            notify.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="standard-form-container">
            <div className="fornecedor-header" style={{ marginBottom: 32 }}>
                <h2>Novo Fornecedor</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group field-nome">
                        <label htmlFor="nomeFornecedor">Nome do Fornecedor *</label>
                        <input 
                            type="text" 
                            id="nomeFornecedor" 
                            placeholder="Ex: Empresa XYZ" 
                            value={formData.nomeFornecedor}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group field-documento">
                        <label htmlFor="documentoFornecedor">CNPJ/CPF *</label>
                        <input 
                            type="text" 
                            id="documentoFornecedor" 
                            placeholder="Digite o documento" 
                            value={formData.documentoFornecedor}
                            onChange={handleChange}
                            maxLength={18}
                            required
                        />
                    </div>

                    <div className="form-group field-telefone">
                        <label htmlFor="telefoneFornecedor">Telefone</label>
                        <input 
                            type="tel" 
                            id="telefoneFornecedor" 
                            placeholder="Ex: (11) 99999-9999" 
                            value={formData.telefoneFornecedor}
                            onChange={handleChange}
                            maxLength={12}
                        />
                    </div>

                    <div className="form-group field-cep">
                        <label htmlFor="cepFornecedor">CEP</label>
                        <input 
                            type="text" 
                            id="cepFornecedor" 
                            placeholder="00000-000" 
                            value={formData.cepFornecedor}
                            onChange={handleChange}
                            maxLength={9}
                        />
                    </div>

                    <div className="form-group field-endereco">
                        <label htmlFor="enderecoFornecedor">Endereço</label>
                        <input 
                            type="text" 
                            id="enderecoFornecedor" 
                            placeholder="Rua, número, complemento" 
                            value={formData.enderecoFornecedor}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group field-bairro">
                        <label htmlFor="bairroFornecedor">Bairro</label>
                        <input 
                            type="text" 
                            id="bairroFornecedor" 
                            placeholder="Bairro" 
                            value={formData.bairroFornecedor}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group field-cidade">
                        <label htmlFor="cidadeFornecedor">Cidade</label>
                        <input 
                            type="text" 
                            id="cidadeFornecedor" 
                            placeholder="Cidade" 
                            value={formData.cidadeFornecedor}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group field-uf">
                        <label htmlFor="ufFornecedor">UF</label>
                        <input 
                            type="text" 
                            id="ufFornecedor" 
                            placeholder="UF" 
                            maxLength={2}
                            style={{ textTransform: 'uppercase' }}
                            value={formData.ufFornecedor}
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
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CadastrarFornecedor;
