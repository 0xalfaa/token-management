import React, { useState, useEffect } from 'react';
import { Search, Plus, Database, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

// Define token type
interface Token {
  id: number;
  owner: string;
  balance: number;
  fundingSource: string;
  tokenName: string;
  fee: number;
  liquidity: number;
  supplyPercentAdded: number;
  timestamp: string;
}

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newToken, setNewToken] = useState<Omit<Token, 'id' | 'timestamp'>>({
    owner: '',
    balance: 0,
    fundingSource: '',
    tokenName: '',
    fee: 0,
    liquidity: 0,
    supplyPercentAdded: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 5;

  // Fetch tokens from backend
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.get<Token[]>(`${API_URL}/tokens`);
        setTokens(response.data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens();
  }, []);

  // Filter tokens based on search term
  const filteredTokens = tokens.filter((token) => {
    const searchString = searchTerm.toLowerCase();
    return (
      token.owner.toLowerCase().includes(searchString) ||
      token.tokenName.toLowerCase().includes(searchString) ||
      token.fundingSource.toLowerCase().includes(searchString)
    );
  });

  // Pagination logic
  const indexOfLastToken = currentPage * tokensPerPage;
  const indexOfFirstToken = indexOfLastToken - tokensPerPage;
  const currentTokens = filteredTokens.slice(indexOfFirstToken, indexOfLastToken);
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewToken({
      ...newToken,
      [name]: name === 'balance' || name === 'fee' || name === 'liquidity' || name === 'supplyPercentAdded' 
        ? parseFloat(value) 
        : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Token>(`${API_URL}/tokens`, newToken);
      setTokens([...tokens, response.data]);
      
      // Reset form
      setNewToken({
        owner: '',
        balance: 0,
        fundingSource: '',
        tokenName: '',
        fee: 0,
        liquidity: 0,
        supplyPercentAdded: 0,
      });
      
      // Switch to list view
      setActiveTab('list');
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-800 text-center">
            Token Management System
          </h1>
          <div className="flex justify-center mt-4">
            <nav className="bg-white rounded-lg shadow-md p-1 inline-flex">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-indigo-100'
                } transition-colors duration-200 flex items-center`}
              >
                <Database className="w-4 h-4 mr-2" />
                Daftar Token
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'add'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-indigo-100'
                } transition-colors duration-200 flex items-center`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Token
              </button>
            </nav>
          </div>
        </header>

        <main className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'list' ? (
            <div>
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Cari token berdasarkan nama, owner, atau sumber..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Token Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Funding Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liquidity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supply %
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTokens.length > 0 ? (
                      currentTokens.map((token) => (
                        <tr key={token.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {token.owner}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                              {token.tokenName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {token.balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {token.fundingSource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {token.fee}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {token.liquidity.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {token.supplyPercentAdded}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(token.timestamp).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada token yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTokens.length > tokensPerPage && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstToken + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastToken, filteredTokens.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredTokens.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              page === currentPage
                                ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                Tambah Data Token Baru
              </h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                      Nama Pemilik Token
                    </label>
                    <input
                      type="text"
                      name="owner"
                      id="owner"
                      required
                      placeholder="Masukkan nama pemilik token"
                      value={newToken.owner}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700">
                      Nama Token
                    </label>
                    <input
                      type="text"
                      name="tokenName"
                      id="tokenName"
                      required
                      placeholder="Masukkan nama token"
                      value={newToken.tokenName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
                      Saldo Token
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="balance"
                        id="balance"
                        required
                        min="0"
                        placeholder="0.00"
                        value={newToken.balance}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        tokens
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fundingSource" className="block text-sm font-medium text-gray-700">
                      Sumber Dana
                    </label>
                    <input
                      type="text"
                      name="fundingSource"
                      id="fundingSource"
                      required
                      placeholder="Masukkan sumber dana"
                      value={newToken.fundingSource}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fee" className="block text-sm font-medium text-gray-700">
                      Biaya (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="fee"
                        id="fee"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newToken.fee}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="liquidity" className="block text-sm font-medium text-gray-700">
                      Likuiditas
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="liquidity"
                        id="liquidity"
                        required
                        min="0"
                        placeholder="0.00"
                        value={newToken.liquidity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        tokens
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="supplyPercentAdded" className="block text-sm font-medium text-gray-700">
                      Persentase Supply Ditambahkan
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="supplyPercentAdded"
                        id="supplyPercentAdded"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={newToken.supplyPercentAdded}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        %
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-6 py-3 text-base font-medium rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-base font-medium rounded-lg border border-transparent bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Tambah Token
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Token Management System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;