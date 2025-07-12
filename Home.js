import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, Plus } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import Pagination from '../components/Pagination';
import QuestionCard from '../components/QuestionCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const filterOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Unanswered', value: 'unanswered' },
  { label: 'Most Voted', value: 'voted' },
];

export default function Home() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [filter, page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Replace with your API endpoint and params
      const res = await axios.get('/api/questions', {
        params: { filter, search, page }
      });
      setQuestions(res.data.questions || []);
      setTotalPages(res.data.pages || 1);
    } catch (e) {
      setQuestions([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center px-2 py-4">
      <div className="w-full max-w-2xl flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex-1 flex gap-2 items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              className="bg-white border border-gray-300 rounded-l px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-r flex items-center hover:bg-blue-50 transition">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
        <Link
          to={user ? "/ask" : "#"}
          onClick={e => { if (!user) { e.preventDefault(); alert('Please login to ask a question!'); } }}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow font-semibold transition-all"
        >
          <Plus className="w-5 h-5" /> Ask New question
        </Link>
      </div>
      <div className="w-full max-w-2xl flex flex-wrap gap-2 mb-4 justify-center">
        <button
          className={`px-6 py-2 rounded-full border text-gray-700 font-medium transition-all ${filter === 'newest' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-blue-50'}`}
          onClick={() => setFilter('newest')}
        >
          Newest
        </button>
        <button
          className={`px-6 py-2 rounded-full border text-gray-700 font-medium transition-all ${filter === 'voted' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-blue-50'}`}
          onClick={() => setFilter('voted')}
        >
          Most Voted
        </button>
        <button
          className={`px-6 py-2 rounded-full border text-gray-700 font-medium transition-all ${filter === 'viewed' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-blue-50'}`}
          onClick={() => setFilter('viewed')}
        >
          Most Viewed
        </button>
        <button
          className={`px-6 py-2 rounded-full border text-gray-700 font-medium transition-all ${filter === 'unanswered' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-blue-50'}`}
          onClick={() => setFilter('unanswered')}
        >
          Unanswered
        </button>
      </div>
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No questions found.</div>
        ) : (
          questions.map(q => <QuestionCard key={q._id} question={q} />)
        )}
      </div>
      <div className="w-full max-w-2xl flex justify-center mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
} 