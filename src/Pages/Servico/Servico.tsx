import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import CadastrarServico from './CadastrarServico';
import ListaServico from './ListaServico';
import '../../Styles/Servico/servico.css';

type ServicoView = 'home' | 'cadastrar' | 'listar';

function Servico() {
    const [view, setView] = useState<ServicoView>('home');

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
                                <h2>Cadastro de Serviço</h2>
                            </div>
                        </div>
                        <CadastrarServico />
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
                                <h2>Lista de Serviços</h2>
                            </div>
                        </div>
                        <ListaServico />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Serviços</h2>
                                <p>Escolha uma das opções abaixo para gerenciar os serviços oferecidos.</p>
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
                                <h3 className="standard-page-card-title">Cadastrar Serviço</h3>
                                <p className="standard-page-card-description">
                                    Adicione novos serviços ao catálogo da empresa.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Listar Serviços</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite ou remova serviços cadastrados.
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

export default Servico;
