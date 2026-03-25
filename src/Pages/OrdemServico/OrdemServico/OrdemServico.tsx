import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import ListaOrdemServico from './ListaOrdemServico';
import CadastrarOrdemServico from './CadastrarOrdemServico';
import '../../../Styles/OrdemServico/OrdemServico/ordemServico.css';

type OrdemServicoView = 'home' | 'cadastrar' | 'listar';

function OrdemServico() {
    const [view, setView] = useState<OrdemServicoView>('home');

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
                                <h2>Nova Ordem de Serviço</h2>
                            </div>
                        </div>
                        <CadastrarOrdemServico />
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
                                <h2>Lista de Ordens de Serviço</h2>
                            </div>
                        </div>
                        <ListaOrdemServico />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Ordens de Serviço</h2>
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
                                <h3 className="standard-page-card-title">Nova Ordem de Serviço</h3>
                                <p className="standard-page-card-description">
                                    Crie uma nova ordem de serviço para um cliente.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Listar Ordens de Serviço</h3>
                                <p className="standard-page-card-description">
                                    Visualize, edite ou gerencie as ordens de serviço existentes.
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

export default OrdemServico;
