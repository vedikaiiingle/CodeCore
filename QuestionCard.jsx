import React from 'react';
import { Link } from 'react-router-dom';

const QuestionCard = ({ question }) => {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition flex flex-col gap-2 bg-gray-800 text-white relative">
      <Link to={`/questions/${question._id}`} className="block">
        <h2 className="text-lg font-semibold mb-1 line-clamp-1">{question.title}</h2>
        <div className="flex flex-wrap gap-2 mb-1">
          {question.tags && question.tags.map(tag => (
            <span key={tag} className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">{tag}</span>
          ))}
        </div>
        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{question.description?.replace(/<[^>]*>/g, '').slice(0, 120)}...</p>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>User: {question.author?.username || question.username || 'Unknown'}</span>
          <span className="bg-gray-700 px-2 py-1 rounded font-bold text-blue-300">{question.answerCount || 0} ans</span>
        </div>
      </Link>
    </div>
  );
};

export default QuestionCard; 