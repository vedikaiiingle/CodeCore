import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiUsers, FiFlag, FiMessageSquare, FiDownload, FiUserX, FiCheck, FiX, 
  FiEye, FiEdit, FiTrash2, FiAlertTriangle, FiBarChart, FiSettings 
} from 'react-icons/fi';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', reputation: 1250, joined: '2024-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'banned', reputation: 2100, joined: '2023-12-15' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'moderator', status: 'active', reputation: 890, joined: '2023-11-20' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', status: 'active', reputation: 450, joined: '2024-01-10' }
  ];

  const mockReports = [
    { id: 1, type: 'question', title: 'Inappropriate content', reporter: 'user1', status: 'pending', createdAt: '2024-01-15T10:30:00Z' },
    { id: 2, type: 'answer', title: 'Spam answer', reporter: 'user2', status: 'resolved', createdAt: '2024-01-14T16:45:00Z' },
    { id: 3, type: 'user', title: 'User violation', reporter: 'moderator1', status: 'pending', createdAt: '2024-01-13T09:15:00Z' }
  ];

  const mockQuestions = [
    { id: 1, title: 'How to implement JWT?', author: 'John Doe', status: 'pending', votes: 15, createdAt: '2024-01-15T10:30:00Z' },
    { id: 2, title: 'React hooks best practices', author: 'Jane Smith', status: 'approved', votes: 8, createdAt: '2024-01-14T14:20:00Z' },
    { id: 3, title: 'Node.js authentication', author: 'Mike Johnson', status: 'rejected', votes: 3, createdAt: '2024-01-13T11:00:00Z' }
  ];

  const mockStats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalQuestions: 456,
    pendingQuestions: 12,
    totalReports: 23,
    pendingReports: 8,
    bannedUsers: 5
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setUsers(mockUsers);
      setReports(mockReports);
      setQuestions(mockQuestions);
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle user actions
  const handleUserAction = (userId, action) => {
    if (action === 'ban') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'banned' } : user
      ));
      toast.success('User banned successfully');
    } else if (action === 'unban') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'active' } : user
      ));
      toast.success('User unbanned successfully');
    } else if (action === 'promote') {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: 'moderator' } : user
      ));
      toast.success('User promoted to moderator');
    }
  };

  // Handle question moderation
  const handleQuestionAction = (questionId, action) => {
    if (action === 'approve') {
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, status: 'approved' } : q
      ));
      toast.success('Question approved');
    } else if (action === 'reject') {
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, status: 'rejected' } : q
      ));
      toast.success('Question rejected');
    }
  };

  // Handle report actions
  const handleReportAction = (reportId, action) => {
    if (action === 'resolve') {
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ));
      toast.success('Report resolved');
    } else if (action === 'dismiss') {
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: 'dismissed' } : r
      ));
      toast.success('Report dismissed');
    }
  };

  // Download reports
  const downloadReport = (type) => {
    toast.success(`${type} report downloaded successfully`);
  };

  // Send platform message
  const sendPlatformMessage = () => {
    toast.success('Platform message sent successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users, moderate content, and monitor platform activity</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: FiBarChart },
                { id: 'users', label: 'Users', icon: FiUsers },
                { id: 'moderation', label: 'Moderation', icon: FiFlag },
                { id: 'reports', label: 'Reports', icon: FiAlertTriangle },
                { id: 'settings', label: 'Settings', icon: FiSettings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
                    { label: 'Active Users', value: stats.activeUsers, color: 'green' },
                    { label: 'Total Questions', value: stats.totalQuestions, color: 'purple' },
                    { label: 'Pending Reports', value: stats.pendingReports, color: 'red' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                          <FiBarChart className={`text-${stat.color}-600`} size={24} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => downloadReport('User Activity')}
                      className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FiDownload className="mr-2" />
                      Download User Report
                    </button>
                    <button
                      onClick={sendPlatformMessage}
                      className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FiMessageSquare className="mr-2" />
                      Send Platform Message
                    </button>
                    <button
                      onClick={() => setActiveTab('moderation')}
                      className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FiFlag className="mr-2" />
                      Review Pending Content
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <FiDownload className="mr-2 inline" />
                    Export Users
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reputation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.reputation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserAction(user.id, 'ban')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiUserX size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, 'unban')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <FiCheck size={16} />
                                </button>
                              )}
                              {user.role === 'user' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'promote')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FiEdit size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Content Moderation</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {questions.map(question => (
                        <tr key={question.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{question.title}</div>
                            <div className="text-sm text-gray-500">{new Date(question.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {question.author}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              question.status === 'approved' ? 'bg-green-100 text-green-800' :
                              question.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {question.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {question.votes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {question.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleQuestionAction(question.id, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <FiCheck size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleQuestionAction(question.id, 'reject')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FiX size={16} />
                                  </button>
                                </>
                              )}
                              <button className="text-blue-600 hover:text-blue-900">
                                <FiEye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Reports Management</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map(report => (
                        <tr key={report.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            <div className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.type === 'question' ? 'bg-blue-100 text-blue-800' :
                              report.type === 'answer' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.reporter}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {report.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'resolve')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <FiCheck size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleReportAction(report.id, 'dismiss')}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    <FiX size={16} />
                                  </button>
                                </>
                              )}
                              <button className="text-blue-600 hover:text-blue-900">
                                <FiEye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Admin Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Platform Announcements</h4>
                    <textarea
                      placeholder="Enter platform-wide announcement..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
                    />
                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Send Announcement
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Export Reports</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => downloadReport('User Activity')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>User Activity Report</span>
                        <FiDownload />
                      </button>
                      <button
                        onClick={() => downloadReport('Content Moderation')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>Moderation Report</span>
                        <FiDownload />
                      </button>
                      <button
                        onClick={() => downloadReport('Platform Statistics')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>Platform Statistics</span>
                        <FiDownload />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 