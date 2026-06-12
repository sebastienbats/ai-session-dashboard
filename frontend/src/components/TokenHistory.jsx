import React, { useState, useEffect } from 'react';
import { fetchTokenHistory } from '../api';

const TokenHistory = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchTokenHistory();
        setHistory(data.history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [refreshTrigger]);

  if (loading) return <div className="history-loading">Chargement de l'historique...</div>;

  return (
    <div className="token-history">
      <h3>📜 Historique des tokens dépensés</h3>
      {history.length === 0 ? (
        <p>Aucune consommation pour l'instant.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Message (extrait)</th>
              <th>Fournisseur</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {history.map(entry => (
              <tr key={entry.id}>
                <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                <td>{entry.message}</td>
                <td><span className="provider-badge">{entry.provider}</span></td>
                <td>{entry.tokensUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TokenHistory;
