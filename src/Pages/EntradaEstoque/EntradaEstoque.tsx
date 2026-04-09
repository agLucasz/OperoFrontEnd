import { useState } from 'react';
import { FiPlusCircle, FiList, FiArrowLeft } from 'react-icons/fi';
import LancarEntradaEstoque from './LancarEntradaEstoque';
import ListarEntradaEstoque from './ListarEntradaEstoque';

type EstoqueView = 'home' | 'lancar' | 'listar';

function EntradaEstoque() {
    const [view, setView] = useState<EstoqueView>('home');

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
                                <h2>Lançar Entrada de Estoque</h2>
                            </div>
                        </div>
                        <LancarEntradaEstoque />
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
                                <h2>Histórico de Entradas</h2>
                            </div>
                        </div>
                        <ListarEntradaEstoque />
                    </>
                );
            default:
                return (
                    <>
                        <div className="standard-page-header">
                            <div>
                                <h2>Entrada de Estoque</h2>
                            </div>
                        </div>

                        <div className="standard-page-cards-container">
                            <div
                                className="standard-page-card"
                                onClick={() => setView('lancar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiPlusCircle size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Lançar Entrada</h3>
                                <p className="standard-page-card-description">
                                    Registre a entrada de produtos no estoque informando produto, quantidade e data.
                                </p>
                            </div>

                            <div
                                className="standard-page-card"
                                onClick={() => setView('listar')}
                            >
                                <div className="standard-page-card-icon">
                                    <FiList size={32} />
                                </div>
                                <h3 className="standard-page-card-title">Histórico de Entradas</h3>
                                <p className="standard-page-card-description">
                                    Consulte e gerencie todas as entradas de estoque já registradas.
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

export default EntradaEstoque;
