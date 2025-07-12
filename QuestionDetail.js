import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiThumbsUp, FiThumbsDown, FiCheck, FiMessageCircle, FiEdit, FiTrash2, FiFlag } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login state
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const quillRef = useRef(null);

  // Mock question data
  const mockQuestion = {
    id: id,
    title: "How to implement JWT authentication in React with Node.js backend?",
    description: `<p>I'm building a full-stack application with React frontend and Node.js backend. I need to implement JWT authentication for user login and protected routes.</p>
    <p>Here's what I've tried so far:</p>
    <ul>
      <li>Created login endpoint that generates JWT token</li>
      <li>Stored token in localStorage</li>
      <li>Added Authorization header to API calls</li>
    </ul>
    <p>But I'm having issues with:</p>
    <ul>
      <li>Token refresh mechanism</li>
      <li>Protected route implementation</li>
      <li>Handling token expiration</li>
    </ul>
    <p>Can someone provide a complete example with best practices?</p>`,
    author: {
      id: 1,
      name: "John Doe",
      avatar: "https://via.placeholder.com/40",
      reputation: 1250
    },
    tags: ["React", "Node.js", "JWT", "Authentication"],
    votes: 15,
    views: 234,
    createdAt: "2024-01-15T10:30:00Z",
    acceptedAnswerId: null
  };

  // Mock answers data
  const mockAnswers = [
    {
      id: 1,
      content: `<p>Here's a complete implementation for JWT authentication in React with Node.js:</p>
      <h3>Backend (Node.js)</h3>
      <pre><code>const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
  
  res.json({ token, user: { id: user._id, email: user.email } });
});</code></pre>
      <h3>Frontend (React)</h3>
      <pre><code>const login = async (email, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};</code></pre>`,
      author: {
        id: 2,
        name: "Jane Smith",
        avatar: "https://via.placeholder.com/40",
        reputation: 2100
      },
      votes: 8,
      createdAt: "2024-01-15T11:00:00Z",
      isAccepted: false
    },
    {
      id: 2,
      content: `<p>For better security, consider implementing refresh tokens:</p>
      <ul>
        <li>Use short-lived access tokens (15-30 minutes)</li>
        <li>Implement refresh token rotation</li>
        <li>Store refresh tokens securely (httpOnly cookies)</li>
      </ul>
      <p>Also, don't forget to handle token expiration gracefully in your React app.</p>`,
      author: {
        id: 3,
        name: "Mike Johnson",
        avatar: "https://via.placeholder.com/40",
        reputation: 890
      },
      votes: 3,
      createdAt: "2024-01-15T11:30:00Z",
      isAccepted: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestion(mockQuestion);
      setAnswers(mockAnswers);
    }, 1000);
  }, [id]);

  // Quill editor modules (simplified)
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'link', 'image'
  ];

  // Handle voting
  const handleVote = (type, itemId, currentVotes) => {
    if (!isLoggedIn) {
      toast.error('Please login to vote');
      return;
    }

    // Simulate API call
    const newVotes = type === 'up' ? currentVotes + 1 : currentVotes - 1;
    
    if (type === 'question') {
      setQuestion(prev => ({ ...prev, votes: newVotes }));
    } else {
      setAnswers(prev => prev.map(answer => 
        answer.id === itemId ? { ...answer, votes: newVotes } : answer
      ));
    }

    toast.success(`Vote ${type === 'up' ? 'added' : 'removed'} successfully`);
  };

  // Handle answer submission
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!newAnswer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    if (!isLoggedIn) {
      toast.error('Please login to post an answer');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAnswerObj = {
        id: Date.now(),
        content: newAnswer,
        author: {
          id: 4,
          name: "Current User",
          avatar: "https://via.placeholder.com/40",
          reputation: 500
        },
        votes: 0,
        createdAt: new Date().toISOString(),
        isAccepted: false
      };

      setAnswers(prev => [newAnswerObj, ...prev]);
      setNewAnswer('');
      setShowAnswerForm(false);
      toast.success('Answer posted successfully!');
    } catch (error) {
      console.error('Error posting answer:', error);
      toast.error('Failed to post answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle accept answer
  const handleAcceptAnswer = (answerId) => {
    if (!isLoggedIn) {
      toast.error('Please login to accept answers');
      return;
    }

    setAnswers(prev => prev.map(answer => ({
      ...answer,
      isAccepted: answer.id === answerId
    })));

    setQuestion(prev => ({
      ...prev,
      acceptedAnswerId: answerId
    }));

    toast.success('Answer accepted!');
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            {/* Voting */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleVote('up', 'question', question.votes)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Upvote"
              >
                <FiThumbsUp className="text-gray-600 hover:text-green-600" />
              </button>
              <span className="font-semibold text-lg">{question.votes}</span>
              <button
                onClick={() => handleVote('down', 'question', question.votes)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Downvote"
              >
                <FiThumbsDown className="text-gray-600 hover:text-red-600" />
              </button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">{question.title}</h1>
              
              <div 
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Question Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>{question.views} views</span>
                  <span>•</span>
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={question.author.avatar}
                    alt={question.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{question.author.name}</span>
                  <span className="text-green-600">• {question.author.reputation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>
            {isLoggedIn && (
              <button
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showAnswerForm ? 'Cancel' : 'Post Answer'}
              </button>
            )}
          </div>

          {/* Answer Form */}
          {showAnswerForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Your Answer</h3>
              <form onSubmit={handleSubmitAnswer}>
                <div className="border border-gray-300 rounded-lg mb-4">
                  <ReactQuill
                    ref={quillRef}
                    value={newAnswer}
                    onChange={setNewAnswer}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your answer here..."
                    className="h-48"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAnswerForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      'Post Answer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Answers List */}
          <div className="space-y-6">
            {answers.map(answer => (
              <div
                key={answer.id}
                className={`border rounded-lg p-4 ${
                  answer.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Voting */}
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      onClick={() => handleVote('up', answer.id, answer.votes)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Upvote"
                    >
                      <FiThumbsUp className="text-gray-600 hover:text-green-600" />
                    </button>
                    <span className="font-semibold">{answer.votes}</span>
                    <button
                      onClick={() => handleVote('down', answer.id, answer.votes)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Downvote"
                    >
                      <FiThumbsDown className="text-gray-600 hover:text-red-600" />
                    </button>
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    {answer.isAccepted && (
                      <div className="flex items-center text-green-600 mb-2">
                        <FiCheck className="mr-1" />
                        <span className="font-medium">Accepted Answer</span>
                      </div>
                    )}
                    
                    <div 
                      className="prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />

                    {/* Answer Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <FiMessageCircle size={14} />
                          <span>Comment</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <img
                          src={answer.author.avatar}
                          alt={answer.author.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{answer.author.name}</span>
                        <span className="text-green-600">• {answer.author.reputation}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 mt-4">
                      {!answer.isAccepted && isLoggedIn && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                        >
                          <FiCheck size={14} />
                          <span>Accept</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                        <FiEdit size={14} />
                        <span>Edit</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                        <FiFlag size={14} />
                        <span>Flag</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail; 