import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import CadastrarFornecedor from './CadastrarFornecedor';
import ListaFornecedor from './ListaFornecedor';
import '../../Styles/Fornecedor/fornecedor.css';

type FornecedorView = 'home' | 'cadastrar' | 'listar';

function Fornecedor() {
    const [view, setView] = useState<FornecedorView>('home');

    const renderContent = () => {
        switch (view) {
            case 'cadastrar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Cadastro de Fornecedor</h2>
                            </div>
                        </div>
                        <CadastrarFornecedor />
                    </>
                );
            case 'listar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Lista de Fornecedores</h2>
                            </div>
                        </div>
                        <ListaFornecedor />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Fornecedores</h2>
                            </div>
                        </div>
                        
                        <div className="standard-page-cards-container">
                            <div 
                                className="standard-page-card"
                                onClick={() => setView('cadastrar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiPlus size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Cadastrar Fornecedores</h3>
                                <p className="standard-page-card-description">
                                    Adicione novos fornecedores à sua base de dados, preenchendo as informações completas.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Acessar Fornecedores Cadastrados</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite ou remova fornecedores já cadastrados no sistema.
                                </p>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="standard-page-container">
            {renderContent()}
        </div>
    );
}

export default Fornecedor;
