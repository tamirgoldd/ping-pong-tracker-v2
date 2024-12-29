// PART 1 START - Imports and State Setup
import React, { useState, useEffect } from 'react';
import { Trophy, Trash2, History, Table, Users } from 'lucide-react';

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.players) setPlayers(Array.isArray(JSON.parse(data.players)) ? JSON.parse(data.players) : []);
        if (data.matches) setMatches(Array.isArray(JSON.parse(data.matches)) ? JSON.parse(data.matches) : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, []);

  // Save data
  useEffect(() => {
    if (!loading && (players.length > 0 || matches.length > 0)) {
      fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players, matches })
      }).catch(error => console.error('Error saving data:', error));
    }
  }, [players, matches, loading]);
// PART 1 END

// PART 2 START - Functions
  const addPlayer = () => {
    if (newPlayer.trim() && !players.some(p => p.name === newPlayer.trim())) {
      setPlayers([...players, {
        name: newPlayer.trim(),
        wins: 0,
        losses: 0,
        winRate: 0,
        pointsScored: 0,
        pointsConceded: 0
      }]);
      setNewPlayer('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addPlayer();
    }
  };

  const deletePlayer = (playerName) => {
    setPlayers(players.filter(player => player.name !== playerName));
    setMatches(matches.filter(match => 
      match.player1 !== playerName && match.player2 !== playerName
    ));
    if (player1 === playerName) setPlayer1('');
    if (player2 === playerName) setPlayer2('');
  };

  const recordMatch = () => {
    if (player1 && player2 && player1 !== player2 && score1 !== '' && score2 !== '') {
      const score1Num = parseInt(score1);
      const score2Num = parseInt(score2);
      
      const newMatch = {
        id: Date.now(),
        date: new Date().toISOString(),
        player1,
        player2,
        score1: score1Num,
        score2: score2Num,
        winner: score1Num > score2Num ? player1 : player2
      };

      setMatches([newMatch, ...matches]);

      setPlayers(players.map(player => {
        if (player.name === player1) {
          const wins = score1Num > score2Num ? player.wins + 1 : player.wins;
          const losses = score1Num < score2Num ? player.losses + 1 : player.losses;
          return {
            ...player,
            wins,
            losses,
            winRate: ((wins / (wins + losses)) * 100).toFixed(1),
            pointsScored: player.pointsScored + score1Num,
            pointsConceded: player.pointsConceded + score2Num
          };
        }
        if (player.name === player2) {
          const wins = score2Num > score1Num ? player.wins + 1 : player.wins;
          const losses = score2Num < score1Num ? player.losses + 1 : player.losses;
          return {
            ...player,
            wins,
            losses,
            winRate: ((wins / (wins + losses)) * 100).toFixed(1),
            pointsScored: player.pointsScored + score2Num,
            pointsConceded: player.pointsConceded + score1Num
          };
        }
        return player;
      }));

      setPlayer1('');
      setPlayer2('');
      setScore1('');
      setScore2('');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.winRate - a.winRate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-2xl text-purple-400">Loading...</div>
      </div>
    );
  }
  // PART 2 END

// PART 3 START - Return JSX
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-3">
            Darrow Employees
          </h1>
          <h2 className="text-3xl font-semibold text-purple-300">
            Ping Pong Tracker
          </h2>
        </div>

        {/* Add Player Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/10 shadow-lg shadow-purple-500/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
            <Users className="w-6 h-6" /> Players
          </h2>
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Enter player name"
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 max-w-xs px-4 py-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-100 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
            <button
              onClick={addPlayer}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg shadow-purple-600/20"
            >
              Add Player
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <div key={player.name} 
                className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 group"
              >
                <span className="font-medium text-purple-100">{player.name}</span>
                <button
                  onClick={() => deletePlayer(player.name)}
                  className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors group-hover:scale-105"
                  title="Delete player"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Record Match Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/10 shadow-lg shadow-purple-500/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
            <History className="w-6 h-6" /> Record Match
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">Player 1</label>
              <select
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-100 focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                <option value="">Select Player 1</option>
                {players.map(player => (
                  <option key={player.name} value={player.name}>{player.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">Score</label>
              <input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Player 1 Score"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">Player 2</label>
              <select
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-100 focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                <option value="">Select Player 2</option>
                {players.map(player => (
                  <option key={player.name} value={player.name}>{player.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">Score</label>
              <input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-purple-500/20 text-gray-100 focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Player 2 Score"
              />
            </div>
          </div>
          <button
            onClick={recordMatch}
            className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg shadow-purple-600/20"
          >
            Record Match
          </button>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/10 shadow-lg shadow-purple-500/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
            <Trophy className="w-6 h-6" /> Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Wins</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Losses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Win Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Points Scored</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Points Conceded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {sortedPlayers.map((player, index) => (
                  <tr key={player.name} className="hover:bg-purple-500/5 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <span className="font-semibold text-purple-400">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-purple-100">{player.name}</td>
                    <td className="px-6 py-4 text-sm text-green-400">{player.wins}</td>
                    <td className="px-6 py-4 text-sm text-red-400">{player.losses}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300">
                        {player.winRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-200">{player.pointsScored}</td>
                    <td className="px-6 py-4 text-sm text-purple-200">{player.pointsConceded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match History */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/10 shadow-lg shadow-purple-500/5">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
            <History className="w-6 h-6" /> Recent Matches
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Players</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-purple-500/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(match.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-100">
                      {match.player1} vs {match.player2}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className="text-purple-400">{match.score1}</span>
                      <span className="mx-2">-</span>
                      <span className="text-purple-400">{match.score2}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300">
                        {match.winner}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
// PART 3 END - File Complete
