import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import '../../Styles/RegistroServico/registroServico.css';
import CadastrarRegistroServico from './CadastrarRegistroServico';
import ListaRegistroServico from './ListaRegistroServico';

type RegistroServicoView = 'home' | 'cadastrar' | 'listar';

function RegistroServico() {
    const [view, setView] = useState<RegistroServicoView>('home');

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
                                <h2>Cadastro de Registro de Serviço</h2>
                            </div>
                        </div>
                        <CadastrarRegistroServico />
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
                                <h2>Lista de Serviços Realizados</h2>
                            </div>
                        </div>
                        <ListaRegistroServico />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Registro de Serviços</h2>
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
                                <h3 className="standard-page-card-title">Registrar Novo Serviço</h3>
                                <p className="standard-page-card-description">Adicione um novo registro de serviço ao sistema</p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Ver Serviços</h3>
                                <p className="standard-page-card-description">Visualize, edite ou exclua os serviços registrados</p>
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

export default RegistroServico;
