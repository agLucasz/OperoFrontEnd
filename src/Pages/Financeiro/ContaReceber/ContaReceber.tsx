import { useState } from 'react';
import { FiPlus, FiList, FiArrowLeft } from 'react-icons/fi';
import LancarContaReceber from './LancarContaReceber';
import ConsultarContaReceber from './ConsultarContaReceber';
import '../../../Styles/Financeiro/contaReceber.css';

type ContaReceberView = 'home' | 'lancar' | 'consultar';

function ContaReceber() {
    const [view, setView] = useState<ContaReceberView>('home');

    const renderContent = () => {
        switch (view) {
            case 'lancar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Gerar Conta a Receber</h2>
                            </div>
                        </div>
                        <LancarContaReceber />
                    </>
                );
            case 'consultar':
                return (
                    <>
                        <div className="standard-sub-page-header">
                            <button className="standard-back-button" onClick={() => setView('home')} title="Voltar">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="standard-page-header" style={{ marginBottom: 0 }}>
                                <h2>Consultar Contas a Receber</h2>
                            </div>
                        </div>
                        <ConsultarContaReceber />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Gestão de Contas a Receber</h2>
                            </div>
                        </div>
                        
                        <div className="standard-page-cards-container">
                            <div 
                                className="standard-page-card"
                                onClick={() => setView('lancar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiPlus size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Gerar Contas</h3>
                                <p className="standard-page-card-description">
                                    Gere novas contas a receber a partir de Ordens de Serviço.
                                </p>
                            </div>

                            <div 
                                className="standard-page-card"
                                onClick={() => setView('consultar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Consultar Contas</h3>
                                <p className="standard-page-card-description">
                                    Visualize e filtre contas a receber pendentes ou quitadas.
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

export default ContaReceber;